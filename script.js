function init () {    
    const { clipboard } = require('electron')
    
    const url = document.getElementById('url')

    url.value = clipboard.readText('clipboard')

    for (let i = 0; i < 3; i++) {
        addRandomVideo(url)
    }
}

init()

for (let element of document.getElementsByClassName('submit')) {
    element.onclick = async () => {
        const logger = require('electron').remote.require('./logger')
        const { shell } = require('electron')

        const fs = require('fs')
        const youtubedl = require('youtube-dl')

        const suggestions = document.getElementById('suggestions')
        const status = document.getElementById('status')
        const url = document.getElementById('url').value

        if (url.includes('youtube.com')) {
            status.innerHTML = 'Loading...'

            let loading = true
            let index = 0

            setInterval(() => {
                switch (index) {
                    case 0:
                        status.innerHTML = `${loading ? 'Load' : 'Download'}ing`
                        index++
                    break

                    case 1:
                        status.innerHTML = `${loading ? 'Load' : 'Download'}ing.`
                        index++
                    break

                    case 2:
                        status.innerHTML = `${loading ? 'Load' : 'Download'}ing..`
                        index++
                    break

                    case 3:
                        status.innerHTML = `${loading ? 'Load' : 'Download'}ing...`
                        index = 0
                    break

                    case 4:
                        status.innerHTML = 'Downloaded 🎉'
                    break
                }
            }, 1000 * .25)

            suggestions.remove()

            // Download
           
            const filename = `${new Date().getTime()}.mp4`
            const directory = fs.readFileSync(`${__dirname}/directory.txt`)
            const path = `${directory}/${filename}`

            const video = youtubedl(url, ['--format=18'], { cwd: __dirname })

            video.on('info', async () => {
                loading = false

                const div = document.getElementById('informations')

                const jsonURL = `http://www.youtube.com/oembed?url=${url}&format=json`
                const jsonFetch = await fetch(jsonURL)
                const jsonFinal = await jsonFetch.json()

                const thumbnail = document.createElement('img')

                thumbnail.src = jsonFinal.thumbnail_url
                thumbnail.width = jsonFinal.thumbnail_width / 2.5
                thumbnail.height = jsonFinal.thumbnail_height / 2.5

                const title = document.createElement('p')
                const author = document.createElement('span')

                title.innerHTML = jsonFinal.title
                author.innerHTML = jsonFinal.author_name

                div.appendChild(thumbnail)
                div.appendChild(title)
                div.appendChild(author)
            })

            video.on('end', () => {
                shell.openPath(path)
                index = 4
                
                const twitter = document.createElement('div')
                const facebook = document.createElement('div')

                const twitterImage = document.createElement('img')
                const facebookImage = document.createElement('img')

                twitter.onclick = () => window.open('https://twitter.com/intent/tweet?ref_src=twsrc%5Etfw&url=YouTube%20Downloader%20https://bit.ly/33CFlue')
                twitter.id = 'shareButton'

                twitterImage.src = './assets/images/twitter.jpg'

                facebook.onclick = () => window.open('https://www.facebook.com/sharer/sharer.php?u=https://bit.ly/33CFlue&amp;src=sdkpreparse')
                facebook.id = 'shareButton'

                facebookImage.src = './assets/images/facebook.jpg'

                twitter.appendChild(twitterImage)
                facebook.appendChild(facebookImage)

                document.getElementById('share').appendChild(twitter)
                document.getElementById('share').appendChild(facebook)
            })
            
            video.pipe(fs.createWriteStream(path))
        } else {
            status.innerHTML = 'Invalid address'
        }
    }
}

function addRandomVideo (url) {
    const youtube = require('youtube-random-video')

    youtube.getRandomVid('AIzaSyA2g8RfZ0c0sTRCzpydaw04u4OmhYVTsuw', (err, data) => {
        const videoURL = `https://www.youtube.com/watch?v=${data.id.videoId}`
        const videoTitle = data.snippet.title
        const videoAuthor = data.snippet.channelTitle

        const thumbnailURL = data.snippet.thumbnails.default.url
        const thumbnailWidth = data.snippet.thumbnails.default.width
        const thumbnailHeight = data.snippet.thumbnails.default.height

        const suggestions = document.getElementById('suggestions')

        const div = document.createElement('div')

        const background = document.createElement('img')

        const title = document.createElement('p')
        const author = document.createElement('span')

        div.onclick = () => { 
            url.value = videoURL
            suggestions.remove()
        }

        background.src = thumbnailURL
        background.width = thumbnailWidth
        background.height = thumbnailHeight

        title.innerHTML = videoTitle
        author.innerHTML = videoAuthor

        div.appendChild(background)
        div.appendChild(title)
        div.appendChild(author)

        suggestions.appendChild(div)
    })
}