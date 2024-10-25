const Path = require('path');
const FileSystem = require('fs');
module.exports = copyStaticFiles;


function copyStaticFiles (electronPath, electronOutPath) {
  /*
  The working dir of Electron is build/main instead of src/main because of TS.
  tsc does not copy static files, so copy them over manually for dev server.
  */
  function copyhndler (path) {
    return FileSystem.promises.cp(Path.join(electronPath, path), Path.join(electronOutPath, path), {
      recursive: true, //复制目录
    })
    // FileSystem.cpSync(
    //   Path.join(electronPath, path),
    //   Path.join(electronOutPath, path),
    //   {
    //     recursive: true, //复制目录
    //   }
    // );
  }
  return copyhndler
}