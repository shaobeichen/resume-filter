const fs = require('fs')
const path = require('path')
const PdfReader = require('pdfreader').PdfReader

const getKeywords = (keywordsFileName) => {
  const keywordsText = fs.readFileSync(keywordsFileName)
  const keywords = keywordsText.toString().split('\r\n')
  const initKeywordsObject = keywords.map((keyword) => {
    return { name: keyword.toLowerCase(), count: 0 }
  })
  // console.log(initKeywordsObject)
  return initKeywordsObject
}

const readPdfFileText = (fileName) => {
  const pdftxt = new Array()
  return new Promise((resolve, reject) => {
    const pdfBuffer = fs.readFileSync(fileName)
    // pdfBuffer contains the file content
    new PdfReader().parseBuffer(pdfBuffer, function (err, item) {
      if (err) console.log('pdf reader error: ' + err)
      else if (!item) {
        resolve(pdftxt.join(''))
      } else if (item.text) {
        pdftxt.push(item.text)
      }
    })
  })
}

const readdir = async (dir, keywords) => {
  const files = fs.readdirSync(dir)

  let result = ''

  for (const filename of files) {
    const pathname = path.resolve(dir, filename)

    try {
      const res = await readPdfFileText(pathname)
      if (res) {
        const keywordsResult = keywords
          .map((v, i) => {
            const match = res.toLowerCase().match(new RegExp(v.name, 'g'))
            if (match) {
              const count = match.filter((v) => v).length
              // console.log(`${v.name}*${count}`)
              return `${v.name}*${count}`
            }
          })
          .filter((v) => v)
          .join(' ')
        // console.log(keywordsResult)
        result += `${filename} ${keywordsResult} \r\n`
        // console.log(result)
      }
    } catch (e) {
      console.log(e)
    }
  }
  // console.log(result)
  return result
}

const createResultFile = async (data) => {
  fs.writeFileSync('./结果.txt', data)
}

const main = async () => {
  const KEYWORDS_FILE = './关键词.txt'
  const keywords = getKeywords(KEYWORDS_FILE)
  const data = await readdir('./files', keywords)
  createResultFile(data)
}

main()
