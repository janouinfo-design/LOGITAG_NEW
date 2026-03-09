export async function FilesToBase64(files) {
  try {
    let output = []
    for (let f of files) {
      let r = await FileToBase64(f)

      output.push(r)
    }
    return output
  } catch (ex) {
    return {success: false, result: ex.message}
  }
}

const FileToBase64 = async (file) => {
  try {
    return new Promise((rs, rj) => {
      const index = file.name.lastIndexOf('.')
      let extension = file.name.slice(index + 1)
      let reader = new FileReader()
      reader.onload = function () {
        rs({
          success: true,
          result: {
            base64: reader.result,
            extension,
            fileType: file.type,
          },
        })
      }
      reader.readAsDataURL(file)
    })
  } catch (ex) {
    return {success: false, result: ex.message}
  }
}
