const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const testDir = 'typing-tests'

function main() {
  let status = true
  fs.readdirSync(testDir).forEach(fileName => {
    const { ok, message, output } = runTestFile(testDir, fileName)
    console.log(`${fileName}: ${message}`)
    if (!ok) {
      status = false
      if (output) {
        console.log('=== compilation error ========================')
        process.stdout.write(output.toString())
        console.log('==============================================')
      }
    }
  })

  if (status) {
    console.log('All tests OK!')
  } else {
    console.log('Some tests failed!')
    process.exit(1)
  }
}

function runTestFile(parentDir, fileName) {
  const match = fileName.match(/^(ok|error)-.*\.ts$/)
  if (!match) {
    return { fileName, ok: false, message: 'unexpected file name' }
  }
  const expectedStatus = match[1]

  let compilationStatus, output
  try {
    child_process.execSync(`tsc --noEmit ${testDir}/${fileName}`)
    compilationStatus = 'ok'
  } catch (err) {
    compilationStatus = 'error'
    output = err.stdout
  }

  if (compilationStatus !== expectedStatus) {
    return {
      fileName,
      ok: false,
      message:
        `expected compilation status ${expectedStatus}, ` +
        `got ${compilationStatus}`,
      output,
    }
  }

  if (expectedStatus === 'error' && compilationStatus === 'error') {
    expectedError = getExpectedError(path.join(parentDir, fileName))
    if (output.indexOf(expectedError) === -1) {
      return {
        fileName,
        ok: false,
        message: `Expected error message was not present in compiler output: ${expectedError}`,
        output,
      }
    }
  }

  return { fileName, ok: true, message: 'success' }
}

function getExpectedError(path) {
  const lines = fs.readFileSync(path, { encoding: 'utf-8' }).split('\n')
  const lastLine = lines[lines.length - 2] // newline after last line => -2
  return lastLine.replace(/^\/\/ /, '')
}

main()
