import * as child_process from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { Either, either, left, right } from 'fp-ts/lib/Either'
import { array } from 'fp-ts/lib/Array'

const testDir = 'tests'

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
  const testFiles = parseTestFiles(testDir)
  if (testFiles.isLeft()) {
    console.log('Error reading test files:')
    console.log(testFiles.value)
    return 1
  }

  const compileResult = compileProject(testDir)
  if (compileResult.isLeft()) {
    console.log('Error building test files:')
    console.log(compileResult.value)
    return 1
  }

  let exitStatus = 0
  checkTestResults(testFiles.value, compileResult.value).forEach(
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

function parseTestFiles(parentDir: string): Either<string, TestFile[]> {
  return array.sequence(either)(
    fs
      .readdirSync(testDir)
      .map((fileName: string) => parseTestFile(parentDir, fileName))
  )
}

function parseTestFile(
  parentDir: string,
  fileName: string
): Either<string, TestFile> {
  const match = fileName.match(/^(ok|error)-.*\.ts$/)
  if (!match) {
    return left(`Invalid test file: ${fileName}`)
  }
  const expectedStatus = match[1]

  if (expectedStatus === 'ok') {
    return right({ fileName, status: 'ok' })
  }

  return right({
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

function compileProject(path: string): Either<string, CompileError[]> {
  try {
    child_process.execSync(`tsc -p .`)
    return right([])
  } catch (err) {
    return array.sequence(either)(
      parseCompilerErrors(err.stdout.toString('utf-8'))
    )
  }
}

function parseCompilerErrors(output: string): Either<string, CompileError>[] {
  return output.split(/(?=^\S)/gm).map((singleError: string) => {
    const match = singleError.match(/^(.+?)\(\d+,\d+\): (.+)/s)
    if (match) {
      return right({
        fileName: path.basename(match[1]),
        output: match[2],
      })
    } else {
      return left(`Unable to parse compiler output: ${singleError}`)
    }
  })
}

function checkTestResults(
  testFiles: TestFile[],
  compileErrors: CompileError[]
): TestResult[] {
  return testFiles.map(testFile => {
    const compileError = compileErrors.find(
      compileError => compileError.fileName === testFile.fileName
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
