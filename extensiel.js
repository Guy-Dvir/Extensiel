window.extensiel = new class Extensiel {
  static instance

  contentDictionary = {
    "en": {
      loaderText: "GLФЯЧ TФ ДLBAЙIД!",
      suffix: {
        default: "el",
        replacableSuffixCases: {
          "e": "el",
          "y": "iel",
          "el": "el"
        }
      }
    }
  }

  constructor() {
    if (window.extensiel) {
      return
    }

    this.usedContent = this.contentDictionary[this.detectPageLang()]
    this.init()
  }

  async init() {
    await this.showLoader()
    await this.transformAllTextNodes(document.body)
    await this.hideLoader()
  }


  injectLoader() {
    const FLAG_IMAGE_PATH = chrome.runtime.getURL('assets/albania_flag.png');

    const FLAG_W = 300
    const FLAG_FRAGMENT_W = 2
    const FLAG_FRAGMENTS_AMOUNT = FLAG_W / FLAG_FRAGMENT_W
    const ANIMATION_TIMING = 200
    const ANIMATION_DELAY = ANIMATION_TIMING / 50

    const flagStyleEl = document.createElement("style")
    flagStyleEl.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&display=swap');
        #flagWrapper {
          width:300px;
          height:200px;
          position:fixed;
          inset:50%;
          transform: translate(-50%,-50%);
          box-shadow: 0 0 0 100vmax white;
          background: white;
          z-index:-9999999999999;
          pointer-events: none;
        }
        #flagWrapper.show{
          z-index:9999999999999;
          animation: show ${ANIMATION_TIMING / 2}ms linear forwards; 
        }
        #flagWrapper.hide{
          animation: hide ${ANIMATION_TIMING / 2}ms linear forwards; 
        }
        .flag-fragment {
          opacity:0;
          width:2px;
          height:100%;
          display:inline-block;
          position:relative;
          background-image:url('${FLAG_IMAGE_PATH}');
          background-size: 300px auto;
          box-shadow:0 1px grey, 0 -1px gray;
          animation: wave ${ANIMATION_TIMING}ms ease-in-out infinite alternate, show ${ANIMATION_TIMING}ms ease-in-out forwards;
        }
        #flagWrapper span {
          position: absolute;
          inset: 50%;
          transform: translate(-50%,-50%);
          text-align: center;
          font-size: 40px;
          font-family: 'Russo One', sans-serif;
          font-weight: black;
          top: calc(100% + 1em);
          white-space: nowrap;
          display: block;
          width: fit-content;
          color:black;
        }
        @keyframes wave{
          0% {	transform:	translate3d(0,5%,0);}
          100% {	transform:	translate3d(0,-5%,0);}
        }
        @keyframes show{
          0% {	opacity:	0}
          100% {	opacity:	1}
        }
        @keyframes hide{
          0% {	opacity:	1}
          100% {	opacity:	0}
        }
      `

    const flagWrapper = document.createElement("div")
    flagWrapper.id = "flagWrapper"

    for (let i = 0; i < FLAG_FRAGMENTS_AMOUNT; i++) {
      const fragmentEl = document.createElement("div")
      fragmentEl.className = "flag-fragment"
      fragmentEl.style.backgroundPosition = `${-i * FLAG_FRAGMENT_W}px 0`
      fragmentEl.style.animationDelay = `${i * ANIMATION_DELAY}ms`
      flagWrapper.appendChild(fragmentEl)
    }

    const flagTitle = document.createElement("span")
    flagTitle.innerHTML = this.usedContent.loaderText
    flagWrapper.appendChild(flagTitle)

    document.body.prepend(flagStyleEl)
    document.body.appendChild(flagWrapper)
  }

  showLoader() {
    this.injectLoader()
    const flagWrapperEl = document.getElementById('flagWrapper')
    flagWrapperEl.classList.add('show')

    return new Promise((resolve) => {
      setTimeout(() => resolve(), 2500)
    })
  }

  hideLoader() {
    const flagWrapperEl = document.getElementById('flagWrapper')
    flagWrapperEl.classList.remove('show')
    flagWrapperEl.classList.add('hide')

    return new Promise((resolve) => {
      setTimeout(() => {
        flagWrapperEl.style.display = "none"
        flagWrapperEl.classList.remove('hide')
        resolve()
      }, 1200);
    })
  }

  async transformAllTextNodes(parentNode) {
    await Promise.all([...parentNode.childNodes].map(async node => {
      await new Promise(resolve => {
        if (node.nodeType == Element.TEXT_NODE && node.nodeValue.replace(/\s/g, '').length > 1) {
          node.nodeValue = node.nodeValue.replace(/(\b[a-z]+\b)/gi, match => {
            return this.addSuffix(match)
          })
        } else if (
          node.nodeType == Element.ELEMENT_NODE &&
          !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.nodeName) &&
          node.id !== 'flagWrapper') {
          this.transformAllTextNodes(node)
        }
        resolve()
      })
    }))
  }

  addSuffix(word) {
    let transformedWord;
    let wordLastLetter = word.substring(word.length - 1).toLowerCase()
    let suffix = this.usedContent.suffix

    if (Object.keys(suffix.replacableSuffixCases).includes(wordLastLetter)) {
        transformedWord = word.substring(0, word.length - 1) + this.checkSuffixCaseByString(word, suffix.replacableSuffixCases[wordLastLetter])
    } else {
      transformedWord = word + this.checkSuffixCaseByString(word, suffix.default)
    }
    return transformedWord
  }

  checkSuffixCaseByString(str, suffix) {
    return str === str.toUpperCase() ? suffix.toUpperCase() : suffix.toLowerCase();
  }


  detectPageLang() {
    //TODO: add hebrew detection
    return "en"
  }
}