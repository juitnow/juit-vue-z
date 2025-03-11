import { Extractor, ExtractorConfig, ExtractorLogLevel, ExtractorMessageCategory } from '@microsoft/api-extractor'
import '@plugjs/eslint'
import { assert, banner, context, exec, Files, find, log, merge, plugjs, resolve, rmrf } from '@plugjs/plug'
import { logLevels } from '@plugjs/plug/logging'
import * as vite from 'vite'

import type { ReportLevel } from '@plugjs/plug/logging'
import type { RollupError } from 'rollup'

export default plugjs({
  async vite(): Promise<Files> {
    banner('Building with Vite')

    const errors = new WeakSet<Error | RollupError>()
    const warnings = new Set<string>()

    const builder = await vite.createBuilder({
      configFile: resolve('vite.config.ts'),

      clearScreen: false,

      customLogger: {
        hasWarned: false,

        info(msg: string, opts: vite.LogErrorOptions = {}) {
          if (opts.error) errors.add(opts.error)
          log.notice(msg)
        },

        warn(msg: string, opts: vite.LogErrorOptions = {}) {
          if (opts.error) errors.add(opts.error)
          this.hasWarned = true
          log.warn(msg)
        },

        warnOnce(msg: string, opts: vite.LogErrorOptions = {}) {
          if (opts.error) errors.add(opts.error)

          if (warnings.has(msg)) return
          warnings.add(msg)

          this.hasWarned = true
          log.warn(msg)
        },

        error(msg: string, opts: vite.LogErrorOptions = {}) {
          if (opts.error) errors.add(opts.error)
          this.hasWarned = true
          log.warn(msg)
        },

        hasErrorLogged(error: Error) {
          return errors.has(error)
        },

        clearScreen() {}, // do nothing!
      },
    })

    const environment = builder.environments['client']
    assert(environment, 'Environment "client" not found')
    const result = await builder.build(environment)
    const entries = Array.isArray(result) ? result : [ result ]

    const files = Files.builder(resolve(builder.config.build.outDir))
    for (const entry of entries) {
      if ('output' in entry) {
        entry.output.forEach((output) => {
          files.add(output.fileName)
        })
      }
    }

    return files.build()
  },

  async tsc(): Promise<void> {
    banner('Checking and generating TypeScript types')
    await rmrf('./build/lib')
    await exec('vue-tsc', '--build', '--force')
  },

  async lint(): Promise<void> {
    banner('Linting source code')

    await merge([
      find('**/*.([cm])?ts', '**/*.([cm])?js', '**/*.vue', { directory: 'lib' }),
      find('**/*.([cm])?ts', '**/*.([cm])?js', '**/*.vue', { directory: 'src' }),
    ]).eslint()
  },

  async dts(): Promise<void> {
    await this.tsc()

    banner('Bundling declaration files')

    const config = ExtractorConfig.prepare({
      packageJsonFullPath: resolve('./package.json'),
      configObjectFullPath: resolve('./api-extractor.json'),
      configObject: {
        projectFolder: resolve('.'),
        mainEntryPointFilePath: resolve('./build/lib/index.d.ts'),

        compiler: {
          tsconfigFilePath: resolve('./tsconfig.app.json'),
        },

        apiReport: { enabled: false },
        docModel: { enabled: false },
        tsdocMetadata: { enabled: false },

        dtsRollup: {
          enabled: true,
          untrimmedFilePath: '',
          publicTrimmedFilePath: resolve('./dist/index.d.ts'),
        },

        messages: {
          compilerMessageReporting: {
            default: { logLevel: ExtractorLogLevel.Warning },
          },
          extractorMessageReporting: {
            'default': { logLevel: ExtractorLogLevel.Warning },
            'ae-forgotten-export': { logLevel: ExtractorLogLevel.None },
            'ae-missing-release-tag': { logLevel: ExtractorLogLevel.None },
          },
          tsdocMessageReporting: {
            'default': { logLevel: ExtractorLogLevel.Warning },
          },
        },
      },
    })

    const report = context().log.report('DTS Bundler Report')

    Extractor.invoke(config, {
      localBuild: false,
      showDiagnostics: false,
      showVerboseMessages: true,
      typescriptCompilerFolder: resolve('node_modules/typescript'),
      messageCallback(message) {
        message.handled = true

        if (message.category === ExtractorMessageCategory.Console) {
          switch (message.logLevel) {
            case ExtractorLogLevel.Error: log.error(message.text); break
            case ExtractorLogLevel.Warning: log.warn(message.text); break
            case ExtractorLogLevel.Verbose: log.notice(message.text); break
            case ExtractorLogLevel.Info: log.notice(message.text); break
            case ExtractorLogLevel.None: log.info(message.text); break
          }
        } else {
          let level: ReportLevel | null = null
          switch (message.logLevel) {
            case ExtractorLogLevel.Error: level = logLevels.ERROR; break
            case ExtractorLogLevel.Warning: level = logLevels.WARN; break
            case ExtractorLogLevel.Verbose: level = logLevels.NOTICE; break
            case ExtractorLogLevel.Info: level = logLevels.NOTICE; break
          }

          if (! level) return
          report.add({
            message: message.text,
            tags: message.messageId,
            file: message.sourceFilePath ? resolve(message.sourceFilePath) : undefined,
            line: message.sourceFileLine,
            column: message.sourceFileColumn,
            level,
          })
        }
      },
    })

    report.done()
  },

  async default(): Promise<void> {
    await this.tsc()
    await this.lint()
    await this.vite()
    await this.dts() // after "vite" (it wipes the "dist" folder)
    banner('Build complete')
  },
})
