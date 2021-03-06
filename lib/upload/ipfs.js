require('colors');
let async = require('async');
let shelljs = require('shelljs');

class IPFS {

  constructor(options) {
    this.options = options;
    this.buildDir = options.buildDir || 'dist/';
    this.plugins = options.plugins;
    this.storageConfig = options.storageConfig;
    this.configIpfsBin = this.storageConfig.ipfs_bin || "ipfs";
  }

  deploy() {
    let self = this;
    async.waterfall([
      function findBinary(callback) {
        let ipfs_bin = shelljs.exec('which ' + self.configIpfsBin).output.split("\n")[0];

        if (ipfs_bin === 'ipfs not found' || ipfs_bin === '') {
          console.log(('=== WARNING: ' + self.configIpfsBin + ' not found or not in the path. Guessing ~/go/bin/ipfs for path').yellow);
          ipfs_bin = "~/go/bin/ipfs";
        }

        return callback(null, ipfs_bin);
      },
      function runCommand(ipfs_bin, callback) {
        let cmd = ipfs_bin + " add -r " + self.buildDir;
        console.log(("=== adding " + self.buildDir + " to ipfs").green);
        console.log(cmd.green);
        let result = shelljs.exec(cmd);

        return callback(null, result);
      },
      function getHashFromOutput(result, callback) {
        let rows = result.output.split("\n");
        let dir_row = rows[rows.length - 2];
        let dir_hash = dir_row.split(" ")[1];

        return callback(null, dir_hash);
      },
      function printUrls(dir_hash, callback) {
        console.log(("=== DApp available at http://localhost:8080/ipfs/" + dir_hash + "/").green);
        console.log(("=== DApp available at http://gateway.ipfs.io/ipfs/" + dir_hash + "/").green);

        return callback();
      }
    ], function (err, _result) {
      if (err) {
        console.log("error uploading to ipfs".red);
        console.log(err);
      }
    });
  }

}

module.exports = IPFS;
