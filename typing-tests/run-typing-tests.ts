import * as child_process from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as Either from 'fp-ts/lib/Either'
import * as Array from 'fp-ts/lib/Array'

type TestFile =
  | {
      status: 'ok'
      fileName: string
    }
  | {
      status: 'error'
      fileName: string
      compileError: string
    }

interface CompileError {
  fileName: string
  output: string
}

interface TestResult {
  ok: boolean
  fileName: string
  message: string
  compileOutput?: string
}

function main(): number {
  const testDir = 'tests'

  const testFiles = parseTestFiles(testDir)
  if (Either.isLeft(testFiles)) {
    console.log('Error reading test files:')
    console.log(testFiles.left)
    return 1
  }

  const compileResult = compileProject()
  if (Either.isLeft(compileResult)) {
    console.log('Error building test files:')
    console.log(compileResult.left)
    return 1
  }

  let exitStatus = 0
  checkTestResults(testFiles.right, compileResult.right).forEach(
    ({ ok, fileName, message, compileOutput }) => {
      console.log(`${fileName}: ${message}`)
      if (compileOutput != null) {
        console.log('=== compilation error ========================')
        process.stdout.write(compileOutput)
        console.log('==============================================')
      }
      if (!ok) exitStatus = 1
    }
  )

  return exitStatus
}

function parseTestFiles(parentDir: string): Either.Either<string, TestFile[]> {
  return Array.sequence(Either.Applicative)(
    fs
      .readdirSync(parentDir)
      .map((fileName: string) => parseTestFile(parentDir, fileName))
  )
}

function parseTestFile(
  parentDir: string,
  fileName: string
): Either.Either<string, TestFile> {
  const match = fileName.match(/^(ok|error)-.*\.ts$/)
  if (!match) {
    return Either.left(`Invalid test file: ${fileName}`)
  }
  const expectedStatus = match[1]

  if (expectedStatus === 'ok') {
    return Either.right({ fileName, status: 'ok' })
  }

  return Either.right({
    fileName,
    status: 'error',
    compileError: getExpectedError(path.join(parentDir, fileName)),
  })
}

function getExpectedError(path: string) {
  const lines = fs.readFileSync(path, { encoding: 'utf-8' }).split('\n')
  const lastLine = lines[lines.length - 2] // newline after last line => -2
  return lastLine.replace(/^\/\/ /, '')
}

function compileProject(): Either.Either<string, CompileError[]> {
  try {
    child_process.execSync(`tsc -p .`)
    return Either.right([])
  } catch (err: unknown) {
    const stdout = (err as child_process.SpawnSyncReturns<Buffer>).stdout
    return Array.sequence(Either.Applicative)(
      parseCompilerErrors(stdout.toString('utf-8'))
    )
  }
}

function parseCompilerErrors(
  output: string
): Either.Either<string, CompileError>[] {
  // TypeScript compile errors have the following format:
  //
  // path/to/filename.ts(2,34) error message
  //   sub-message
  //     sub-sub-message
  // path/to/other.ts(3,5) error message
  //   sub-message
  // ...
  //
  return output.split(/(?=^\S)/gm).map((singleError: string) => {
    const match = singleError.match(/^(.+?)\(\d+,\d+\): (.+)/s)
    if (match) {
      return Either.right({
        fileName: path.basename(match[1]),
        output: match[2],
      })
    } else {
      return Either.left(`Unable to parse compiler output: ${singleError}`)
    }
  })
}

function checkTestResults(
  testFiles: TestFile[],
  compileErrors: CompileError[]
): TestResult[] {
  return testFiles.map((testFile) => {
    const compileError = compileErrors.find(
      (compileError) => compileError.fileName === testFile.fileName
    )
    if (testFile.status === 'ok') {
      if (compileError) {
        return {
          ok: false,
          fileName: testFile.fileName,
          message: 'Expected success but got compilation error',
          compileOutput: compileError.output,
        }
      }
    } else {
      if (!compileError) {
        return {
          ok: false,
          fileName: testFile.fileName,
          message: 'Expected compilation error but got success',
        }
      }

      if (compileError.output.indexOf(testFile.compileError) === -1) {
        return {
          ok: false,
          fileName: testFile.fileName,
          message: `Expected error message was not present in compiler output: ${testFile.compileError}`,
          compileOutput: compileError.output,
        }
      }
    }
    return { ok: true, fileName: testFile.fileName, message: 'ok' }
  })
}

process.exit(main())
