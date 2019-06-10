const child_process = require('child_process')
const fs = require('fs')

const testDir = 'typing-tests'

function runTestFile(fileName) {
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
  return { fileName, ok: true, message: 'success' }
}

let status = true
fs.readdirSync(testDir).forEach(fileName => {
  const { ok, message, output } = runTestFile(fileName)
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
