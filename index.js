/* 
  Youtube video downloader powered by:
  https://github.com/fent/node-ytdl-core
  https://github.com/parshap/node-sanitize-filename
*/

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const colors = require('colors')
const ytdl = require('ytdl-core')
const sanitize = require('sanitize-filename')

colors.enable()

const rl = readline.createInterface({
  input: getStdin(),
  output: getStdout(),
  terminal: false
})

const homePath = path.join(
  process.env['HOME'], 'Documents'
)

const tmpPath = path.join(
  homePath, 'tmp_video.mp4'
) 

const prompt = () => {
  getStdout().write('Enter URL to Youtube video: ')
}

const download = (url) => {
  var progress = 0
  var videoTitle = null
  const filter = (format) => {
  	return format.container === 'mp4'
  }
  ytdl(url, { filter: filter })
    // Retain video title
    .on('info', (info, format) => {
      videoTitle = info.player_response.videoDetails.title
    })
    // Notify progress
    .on('progress', (chunk, downloaded, total) => {
      let percent = Math.floor((downloaded / total) * 100)
      if (percent != progress) {
        getStdout().write('\r                         \rProgress: ' + colors.yellow(percent) + colors.yellow('%'));
      }
      progress = percent
    })
    // Rename file once download finishes
    .on('finish', () => {
      getStdout().write('\r                                       \rProgress: ' + colors.green('Done!'));
      const videoPath = path.join(
        homePath, sanitize(videoTitle) + '.mp4'
      )
      fs.rename(tmpPath, videoPath)
      console.log('\nDownloaded: "'+ videoTitle +'"\n\n')
      prompt()
    })
    // Write file to output
    .pipe(fs.createWriteStream(tmpPath))
}

// Take video URL from stdin
rl.on('line', download)

prompt()
