import { useState } from 'react';

type AboutTab = 'welcome' | 'museum' | 'inspiration';

export function AboutPage() {
  const [activeTab, setActiveTab] = useState<AboutTab>('welcome');

  const hardwareItems = [
    {
      title: 'Behringer TD-3 MO (My Personal Recommendation)',
      description: 'The TD-3 MO is my daily driver. It captures the essence of the 303 at an incredible price point. Desktop format, solid build, and the sound is absolutely there.',
      link: 'https://www.amazon.com/Behringer-000-EYF02-00010-TD-3-MO-SR/dp/B09B6SQHXN/ref=sr_1_1?crid=C4F2YKQWTNY4&dib=eyJ2IjoiMSJ9.2ifWKAeFIfJMHpIOEMR6S4ubL0HvtoxMhVheuTyy71kn5E_yl979ApzWBacjbzkpB8eEweXzvlNcAx32AX4vSWivADLpeuI66LRo2VcfEmWJPwnoW7qMNg7zCPU5Cg4uQNPFN0wjweyTB81D-AidlTK8Q7PasjG58bfbby9dfJ5aKhcixUD-Cvj7bdIJ8w6UlpuuCYsZUG0UVm1UdqbQIeH58_BSzdIdXFJrMeCHIsvlhRiglUoq7QGJHv-bg_jzZXNIymH4z5Dw1cFv-Njfoyng7yUoUT8JjrTJaVHSu1A.wDZm62n_iPRt3DCGokyB9aSZxh4Ja1OXqpv8YheZFjY&dib_tag=se&keywords=tb-3-mo+behringer&qid=1769094561&sprefix=tb-3-mo+behringe%2Caps%2C127&sr=8-1',
      affiliate: true,
      image: 'https://m.media-amazon.com/images/I/81X8t205dcL._AC_SL1500_.jpg',
      alt: 'Behringer TD-3 MO bassline synthesizer product photo',
      linkLabel: 'View on Amazon (affiliate link) ↗',
    },
    {
      title: 'Behringer TD-3 (Classic Budget Option)',
      description: 'The bread and butter 303 clone. Rock solid, iconic orange look, and gets the job done beautifully.',
      link: 'https://www.amazon.com/Behringer-TD-3-AM-Synthesizer/dp/B0855K2MN2/ref=sr_1_2?crid=2YL6C7WXO7ATL&dib=eyJ2IjoiMSJ9.KM-PV8HweRNxon757IAunQt_GKMmT5HkTUW-vdrvdrsGJx8t7rIywbyTzE5lFmq2Vgen9EzWZ1LU42PbHtPF3BaL_ZMlDU-bRZD7VCHZ1H0Pi1QowZLsD_KV7okWGskb8HC1TseLG9kA7qcWxt3IVrOstQjtEJUM8Dt-y2tyjesotevGak8RneiwsfTOk9-5O8D1twLy3dA0god9aLAHLD6_ns7TxpbkByHeGCJu3zuZA0NhpjDAu5xibFlLtu8xeT6fBhwWn7-A4pNbiCRP14RiKiNpIaitp-Jilu0GlEY.BYO-aXCJ9g266D6Nin8UffLb27SsvdjpVhs8nh4_bpY&dib_tag=se&keywords=tb+303&qid=1769094702&sprefix=tb+303%2Caps%2C198&sr=8-2',
      affiliate: true,
      image: 'https://m.media-amazon.com/images/I/719w+coLrUL._AC_SL1500_.jpg',
      alt: 'Behringer TD-3 classic bassline synthesizer product photo',
      linkLabel: 'View on Amazon (affiliate link) ↗',
    },
    {
      title: 'DinSync RE-303 (Boutique Boutique)',
      description: 'The premium choice. Absolutely gorgeous, hand-crafted, and sounds incredibly close to the original. If you want the real deal feel, this is it.',
      link: 'https://www.kumptronics.com/shop/electronic-instruments/#cc-m-product-11786939257',
      affiliate: false,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjZRm2BEIIQClg-FnDwsv_c5FY7WbvuIrCbOvlxkVVG2dyoc7Q4Fm28z6y1BgY8onjYze7ZpKLBVhQrBx72ZL0BLJQ9Icm-U_adRRbOxkCfWoDpsl7YVbHqyQSBVceVsniC8cT52w/s1600/2.jpg',
      alt: 'DinSync RE-303 style boutique silver bassline synth',
      linkLabel: 'View at Kumptronics ↗',
    },
    {
      title: 'Roland TB-03 (Boutique Official)',
      description: 'The official Roland re-issue. Compact, highly respected, and authentic to the original design.',
      link: 'https://www.amazon.com/Roland-TB-03-Bass-Line-Synthesizer/dp/B01M1DS5VV/ref=sr_1_1?crid=3HAWAWBXBF9V0&dib=eyJ2IjoiMSJ9.KM-PV8HweRNxon757IAunWYad86PP7o87cdo5PVAQz-QYtb4rOOYDIjihhA0n-xZnJAXV0Thrpmu3MV7t9kET3K7GrjhBMEMD2huV_K2yrZLgVkY4cV8TDxKHGaCFAl_-VI7kTEZjDAC89i6Sp08W7OstQjtEJUM8Dt-y2tyjes1pYLOZ9kz9Bc2uuNzKQZ_A1m_yAUz8oP2IEW2RzPScjaMgHbuzeMTe1r_X8DrX4cGzb8s-yjrtKI3zv6ekR1crznlQU_wBTi7FK3EdnfgE4WI0-Bm0jyg7F82zxdWSY0.t5dlSpcFRXikk2xd5owNXG9MaOLG1wEA6WdSh64MPMo&dib_tag=se&keywords=tb+303&qid=1769094634&sprefix=tb+303%2Caps%2C140&sr=8-1',
      affiliate: true,
      image: 'https://m.media-amazon.com/images/I/714I81jBaML._AC_SL1500_.jpg',
      alt: 'Roland TB-03 boutique bassline synthesizer product photo',
      linkLabel: 'View on Amazon (affiliate link) ↗',
    },
    {
      title: 'Erica Synths Acidlab Bassline',
      description: 'Another solid boutique option with a unique character. Great for experimental acid work.',
      link: 'https://www.amazon.com/Erica-Synths-Bassline-Desktop-Synthesizer/dp/B08NTPXNNV/ref=sr_1_2?crid=1OZ7H3H24D5YE&dib=eyJ2IjoiMSJ9.aYpgf8O-Kxwnw_VijtFZMN-el_nS0bOUzYDG7FoiEgE.cmmvsC0POtNWPx2awksirFuBfOGEtnsMSgj9sl1rIng&dib_tag=se&keywords=acid+lab+bassline+synth&qid=1769094818&sprefix=acidlab+bassline+synth%2Caps%2C131&sr=8-2',
      affiliate: true,
      image: 'https://m.media-amazon.com/images/I/61JWN9uNDUL._AC_SL1106_.jpg',
      alt: 'Erica Synths Acidlab Bassline desktop synthesizer product photo',
      linkLabel: 'View on Amazon (affiliate link) ↗',
    },
    {
      title: 'Donner Essential B1',
      description: 'Affordable entry point with solid sound. Great for beginners exploring the 303 world.',
      link: 'https://www.amazon.com/Synthesizer-Donner-Essential-B1-Saturation/dp/B0BZ772G4B/ref=sr_1_4?crid=2YL6C7WXO7ATL&dib=eyJ2IjoiMSJ9.KM-PV8HweRNxon757IAunQt_GKMmT5HkTUW-vdrvdrs22Nv1P6_hgAnYuTBBb0c7lojgjHtA6gvBDauLR35wpHHDN1X66BiDO4pI5wrriPXEMYpz54wvoEwNcxQqBHeQ8HC1TseLG9kA7qcWxt3IVrOstQjtEJUM8Dt-y2tyjes1pYLOZ9kz9Bc2uuNzKQZ_haFzitDpDHADtVCmgPbQZz6_ns7TxpbkByHeGCJu3ztSguVpQukGdoGO5Xi8xbj5ue5dKBNExXbKvnRckGn27IRiKiNpIaitp-Jilu0GlEY.L1fcV62wuIjeoE0wPlvmTx40cBRfSJ4nWCxnqZf5lKU&dib_tag=se&keywords=tb+303&qid=1769094865&sprefix=tb+303%2Caps%2C198&sr=8-4',
      affiliate: true,
      image: 'https://m.media-amazon.com/images/I/61lPecDR57L._AC_SL1500_.jpg',
      alt: 'Donner Essential B1 bass synthesizer product photo',
      linkLabel: 'View on Amazon (affiliate link) ↗',
    },
  ];

  const softwareItems = [
    {
      title: 'ReBirth RB-338 (Historical - Permanently Discontinued)',
      description: 'The original 303 software emulator that started it all. Two TB-303s, TR-808, TR-909, and effects—all in one app. Unfortunately, ReBirth was permanently discontinued due to copyright issues with Roland and is no longer available for download.',
      link: 'https://en.wikipedia.org/wiki/ReBirth_RB-338',
      affiliate: false,
      image: 'https://upload.wikimedia.org/wikipedia/en/d/da/Rebirth_rb-338_screenshot.png',
      alt: 'ReBirth RB-338 software interface screenshot',
      linkLabel: 'Read about ReBirth on Wikipedia ↗',
    },
    {
      title: 'Reason Rack (My Personal Recommendation)',
      description: 'Reason Studios\' legendary virtual rack. Feels like real gear with virtual cables and modular routing. It\'s a full-fledged DAW that records audio, but the soft synth and effects side is also available as a plugin for other DAWs if that\'s what you prefer. I used this heavily for years and still love it.',
      link: 'https://www.reasonstudios.com/rack',
      affiliate: false,
      image: 'https://www.reasonstudios.com/images/rack2.webp',
      alt: 'Reason Rack virtual studio interface',
      linkLabel: 'Visit Reason Studios ↗',
    },
    {
      title: 'Reaktor 6 (Build Anything)',
      description: 'Native Instruments\' modular synthesis powerhouse. Build custom 303s, granular synths, generative sequencers—anything you can imagine. Steep learning curve but infinitely powerful.',
      link: 'https://www.native-instruments.com/en/products/komplete/synths/reaktor-6/',
      affiliate: false,
      image: 'https://www.native-instruments.com/typo3temp/pics/img-ce-reaktor-6-overview-05-reaktor-blocks_neu_02-9f051feee51f73542d3cfd865306ef34-d@2x.jpg',
      alt: 'Native Instruments Reaktor 6 Blocks modular interface',
      linkLabel: 'Visit Native Instruments ↗',
    },
  ];

  const resourceItems = [
    {
      title: 'Roland TB-303 Pattern Book',
      description: 'Classic paper pattern sheets for recording your favorite basslines. For when you want that vintage feel.',
      link: 'https://www.amazon.com/Roland-TB-303-Pattern-book-favorites/dp/B0CH292Z3W?tag=p303-20',
      affiliate: true,
      image: 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/f1e8da51-0102-4ad1-8581-5459d450c413.__CR0,0,1940,600_PT0_SX970_V1___.jpg',
      alt: 'Roland TB-303 pattern book cover',
      linkLabel: 'View on Amazon (affiliate link) ↗',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-amber-400">Pattern 303</h1>
        <p className="text-xl text-gray-300">A love letter to the legendary TB-303</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab('welcome')}
          className={`px-4 py-2 rounded-lg font-mono transition-colors ${
            activeTab === 'welcome'
              ? 'bg-amber-600 text-white'
              : 'bg-synth-panel text-gray-300 hover:text-white'
          }`}
        >
          Welcome
        </button>
        <button
          onClick={() => setActiveTab('museum')}
          className={`px-4 py-2 rounded-lg font-mono transition-colors ${
            activeTab === 'museum'
              ? 'bg-amber-600 text-white'
              : 'bg-synth-panel text-gray-300 hover:text-white'
          }`}
        >
          303 Museum
        </button>
        <button
          onClick={() => setActiveTab('inspiration')}
          className={`px-4 py-2 rounded-lg font-mono transition-colors ${
            activeTab === 'inspiration'
              ? 'bg-amber-600 text-white'
              : 'bg-synth-panel text-gray-300 hover:text-white'
          }`}
        >
          Inspiration
        </button>
      </div>

      {/* Welcome Tab */}
      {activeTab === 'welcome' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-synth-panel rounded-lg p-8 space-y-4 border border-gray-700">
            <h2 className="text-2xl font-bold text-amber-400">Hey there! Welcome to Pattern 303</h2>

            <p className="text-gray-300 leading-relaxed">
              I'm <span className="text-amber-300 font-bold">mconstant</span>, and I built this site out of a simple desire: to have a place where I could definitively store and organize all my 303 patterns in one spot. After getting a physical machine recently as a gift I wanted a mobile-first webapp that was capable of storing and viewing patterns in a way that is easy to work with while programming the physical TB-303 or transcribing patterns off of them for later use... anywhere... anytime.
            </p>

            <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-900/20">
              <p className="text-amber-100 italic">
                Pattern 303 is my love letter to the legendary Roland TR-303 and its spirit of creative possibility.
              </p>
            </div>

            <h3 className="text-xl font-bold text-amber-300 mt-6">My 303 Journey</h3>

            <p className="text-gray-300 leading-relaxed">
              While I was in engineering school, my roommate opened my eyes to the demoscene. He sat me down with demos by The Black Lotus that had that distinct acid squelch under the visuals, and I was instantly hooked by the idea that code, music, and art could collide like that.
            </p>

            <p className="text-gray-300 leading-relaxed">
              From there I dove deep into crews like Fudge, Haujobb, CNCD, Aardbei, 3state, TPOLM, and farbrausch. If you have even a passing interest in this world, spend an evening on{' '}
              <a
                href="https://www.pouet.net/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 font-mono"
              >
                pouet.net
              </a>{' '}
              —it is a treasure trove and I cannot recommend it enough.
            </p>

            <p className="text-gray-300 leading-relaxed">
              My relationship with the 303 started in the late '90s when I first laid hands on Propellerhead's{' '}
              <a
                href="https://en.wikipedia.org/wiki/ReBirth_RB-338"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-200 hover:text-amber-100 underline"
              >
                ReBirth RB-338
              </a>
              . That software was magic—two 303 emulations, an 808, an 909, and effects—all on your computer. Sadly, it was{' '}
              <a
                href="https://www.reasonstudios.com/rebirth"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-200 hover:text-amber-100 underline"
              >
                permanently discontinued due to copyright issues
              </a>
              {' '}with Roland and is no longer available. Absolute legend status nonetheless.
            </p>

            <p className="text-gray-300 leading-relaxed">
              I was also a heavy user of Propellerhead's{' '}
              <a
                href="https://www.reasonstudios.com/rack"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-200 hover:text-amber-100 underline"
              >
                Reason
              </a>
              {' '}for years—it's a full-fledged DAW that records audio and feels like a real rack of gear. The soft synth and effects side is also available as a plugin for other DAWs if that's what you prefer. Highly recommended if you want that hands-on modular workflow without the physical cables. The company is now called{' '}
              <a
                href="https://www.reasonstudios.com/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-200 hover:text-amber-100 underline"
              >
                Reason Studios
              </a>
              .
            </p>

            <p className="text-gray-300 leading-relaxed">
              And then there was{' '}
              <a
                href="https://www.native-instruments.com/en/products/komplete/synths/reaktor-6/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-200 hover:text-amber-100 underline"
              >
                Reaktor
              </a>
              {' '}by{' '}
              <a
                href="https://www.native-instruments.com/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-200 hover:text-amber-100 underline"
              >
                Native Instruments
              </a>
              —a modular synthesis environment where you can build literally anything. Want a custom 303 with extra oscillators? A granular synth? A generative sequencer? Reaktor lets you build it from the ground up. I cannot recommend it enough for the synthesis-curious.
            </p>

            <p className="text-gray-300 leading-relaxed">
              These tools opened my eyes to what was possible with a simple synthesizer, a filter, and a sequencer. I was captivated.
            </p>

            <p className="text-gray-300 leading-relaxed">
              As an <span className="text-amber-200">IDM listener and electronic music enthusiast</span>, the 303 became more than just an instrument—it became a gateway. Artists like Aphex Twin, Autechre, and the whole ambient/acid house movement showed me how to push the boundaries of what this machine could do. And then there were the raves, the sweaty warehouse parties where that unmistakable <span className="italic">wobble</span> of a resonant filter sweep would make a thousand people move as one. If you've ever had a chance to be a part of making people move, using synths like this, two Tech 12s and a mixer or your voice or some instruments, this site is for you.
            </p>

            <p className="text-gray-300 leading-relaxed">
              Every pattern I've ever created on a 303—whether it's a hypnotic acid bassline, a delicate melodic sequence, or an experimental drone—is a little piece of that journey. This site is dedicated to preserving those moments, celebrating the machine that made them possible, and inviting you to create your own.
            </p>

            <h3 className="text-xl font-bold text-amber-300 mt-6">What This Place Is</h3>

            <ul className="space-y-2 text-gray-300">
              <li className="flex gap-2">
                <span className="text-amber-400">♫</span>
                <span><span className="font-bold">Create & Edit</span> — Design your own 303 patterns with an intuitive step sequencer</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">🔊</span>
                <span><span className="font-bold">Hear Them</span> — Play patterns in real-time with Web Audio synthesis</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">🪙</span>
                <span><span className="font-bold">Own Them</span> — Mint your patterns as NFTs on Solana (decentralized ownership)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">🌐</span>
                <span><span className="font-bold">Share Them</span> — Discover and remix patterns created by the community</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">💰</span>
                <span><span className="font-bold">Get Perks</span> — Hold 303 tokens to mint patterns for free and get discounts</span>
              </li>
            </ul>

            <p className="text-gray-400 text-sm pt-4">
              Whether you're a seasoned 303 enthusiast or just discovering the magic for the first time, there's room for you here. Create, share, and celebrate the 303 with us.
            </p>

            <div className="bg-gray-800/60 border border-amber-700 rounded-lg p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">Pattern 303 Token ($303)</span>
              </div>
              <p className="text-gray-300 text-sm">
                The token exists so seriously interested people can use this place the way it was meant to be used: as a mostly free, super robust store for their patterns. If you're excited about that, grab a little $303 and ride along.
              </p>
              <ul className="space-y-1 text-gray-300 text-sm list-disc list-inside">
                <li>Mint costs flow to a shared treasury wallet that pays for improving and fixing the site.</li>
                <li>Bugs will happen—this is a passion project with no guarantees—but holding a small amount of $303 (303 ackshually) unlocks useful functionality at a nominal cost.</li>
                <li>Even if no one else uses this site, at least I will! 😵‍💫</li>
              </ul>
              <p className="text-gray-400 text-xs">
                If you're here because you love 303 patterns, picking up some $303 is a way to keep the lights on and keep building.
              </p>
            </div>

            <div className="bg-gray-800/60 border border-purple-700 rounded-lg p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-purple-300 font-bold">Nom de Guerre</span>
                <span className="text-gray-500 text-xs">(vanity alias)</span>
              </div>
              <p className="text-gray-300 text-sm">
                Your <span className="font-mono text-purple-200">nom de guerre</span> is a vanity alias—a creative handle specifically for Pattern 303. Think of it as your artist name on the site: it's what other people see when they discover your patterns.
              </p>
              <p className="text-gray-300 text-sm">
                It's purely cosmetic, optional, and fun. Behind the scenes, everything is still tied to your wallet address. But if you'd rather share patterns as "acid_wizard" or "303_dreamer" instead of a long Solana address, this is how you do it.
              </p>
              <p className="text-gray-400 text-xs">
                Your nom de guerre is stored on-chain as an NFT and can be updated anytime. It only exists within Pattern 303—it's not a Solana domain or universal identity.
              </p>
            </div>

            <div className="bg-gray-800/60 border border-blue-700 rounded-lg p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-300 font-bold">Profile ASCII Art</span>
                <span className="text-gray-500 text-xs">(local storage)</span>
              </div>
              <p className="text-gray-300 text-sm">
                Your ASCII avatar is currently stored in your browser's local storage only—it won't sync across devices or browsers unless you export/import it manually.
              </p>
              <p className="text-gray-400 text-xs">
                Future update: On-chain avatar storage is planned! For now, your ASCII art is just for fun and will stay on the device you created it on.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Museum Tab */}
      {activeTab === 'museum' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-synth-panel rounded-lg p-8 space-y-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-amber-400">303 Museum: Hardware & Resources</h2>

            <p className="text-gray-300">
              The 303 has inspired countless instruments and re-interpretations. Here are some of my favorites, along with helpful resources to deepen your knowledge.
            </p>

            {/* Modern Hardware */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-300">🎛️ Modern 303 Clones & Homages</h3>

              <div className="space-y-3">
                {hardwareItems.map((item) => (
                  <div key={item.title} className="bg-gray-800/50 rounded p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="w-full sm:w-48 h-32 rounded border border-gray-700 overflow-hidden bg-gray-900/70">
                        <img
                          src={item.image}
                          alt={item.alt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="font-bold text-amber-200">{item.title}</div>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 text-sm font-mono"
                        >
                          {item.linkLabel}
                        </a>
                        {item.affiliate && (
                          <p className="text-gray-500 text-xs">
                            📍 Affiliate disclosure: I earn a small commission if you purchase through this link, at no extra cost to you.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Software & DAWs */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-300">💻 Software & DAWs</h3>

              <div className="space-y-3">
                {softwareItems.map((item) => (
                  <div key={item.title} className="bg-gray-800/50 rounded p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="w-full sm:w-48 h-32 rounded border border-gray-700 overflow-hidden bg-gray-900/70">
                        <img
                          src={item.image}
                          alt={item.alt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="font-bold text-amber-200">{item.title}</div>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 text-sm font-mono"
                        >
                          {item.linkLabel}
                        </a>
                        {item.affiliate && (
                          <p className="text-gray-500 text-xs">
                            📍 Affiliate disclosure: I earn a small commission if you purchase through this link, at no extra cost to you.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-300">📚 Physical & Digital Resources</h3>

              {resourceItems.map((item) => (
                <div key={item.title} className="bg-gray-800/50 rounded p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:w-48 h-32 rounded border border-gray-700 overflow-hidden bg-gray-900/70">
                      <img
                        src={item.image}
                        alt={item.alt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="font-bold text-amber-200">{item.title}</div>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 text-sm font-mono"
                      >
                        {item.linkLabel}
                      </a>
                      {item.affiliate && (
                        <p className="text-gray-500 text-xs">
                          📍 Affiliate disclosure: I earn a small commission if you purchase through this link, at no extra cost to you.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-4">
              <p className="text-yellow-200 text-sm">
                <span className="font-bold">Affiliate Transparency:</span> Some links above are Amazon affiliate links. If you make a purchase through them, I receive a small commission at no extra cost to you. This helps support Pattern 303 development. The photos shown here are representative instrument shots so you can quickly eyeball the gear; check the listing for exact details. Thank you! 🙏
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inspiration Tab */}
      {activeTab === 'inspiration' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-synth-panel rounded-lg p-8 space-y-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-amber-400">Inspiration & Community</h2>

            <p className="text-gray-300">
              This project stands on the shoulders of giants—both in electronic music history and the incredible creators making 303 content today.
            </p>

            {/* Creators */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-300">🎵 Creators I Love</h3>

              <div className="bg-gray-800/50 rounded p-4 space-y-3">
                <div>
                  <div className="font-bold text-amber-200">Captain Pikant</div>
                  <p className="text-gray-300 text-sm mb-2">
                    One of my absolute favorite 303 explorers. Captain Pikant dissects patterns and beats and presents them with unmatched production values. This video is essential viewing:
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=kf2-WLK3gPA"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 text-sm font-mono"
                  >
                    Watch: "A Short History of the 303 in 12 songs 🙂 How the 303 failed successfully - our fav TB-303 patterns" on YouTube ↗
                  </a>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded p-4 space-y-3">
                <div>
                  <div className="font-bold text-amber-200">Digiphex</div>
                  <p className="text-gray-300 text-sm mb-2">
                    An music tech educator. He can pull apart Boards of Canada and Aphex Twin and show you how to do them as well. Deep, hypnotic, and totally inspiring. Check out this video:
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=Yg9Z0BvxD0s"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 text-sm font-mono"
                  >
                    Watch on YouTube ↗
                  </a>
                  <p className="text-gray-300 text-sm mt-2">
                    If you dig his work, <span className="font-bold">support him on Patreon</span> and join the <span className="font-bold">606 Club</span> for exclusive content!
                  </p>
                </div>
              </div>
            </div>

            {/* Influences */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-300">🌍 Major Influences</h3>

              <div className="bg-gray-800/50 rounded p-4 space-y-3">
                <div>
                  <div className="font-bold text-amber-200">Ishkur's Guide to Electronic Music</div>
                  <p className="text-gray-300 text-sm mb-2">
                    The definitive interactive map of electronic music genres, history, and connections. This site's museum aesthetic is directly inspired by Ishkur's brilliant approach to music taxonomy and storytelling.
                  </p>
                  <a
                    href="https://music.ishkur.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 text-sm font-mono"
                  >
                    Visit Ishkur's Guide ↗
                  </a>
                  <p className="text-gray-400 text-xs mt-2">
                    If you haven't explored it yet, spend an afternoon on Ishkur's—it's absolutely mesmerizing.
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Note */}
            <div className="bg-amber-900/30 border border-amber-700 rounded p-4 space-y-2">
              <p className="text-amber-100 font-bold">The TB-303: A Brief History</p>
              <p className="text-gray-300 text-sm">
                Designed by Roland in 1982 as a bass guitar emulator, the 303 was initially a commercial failure. But in the late 80s, electronic musicians discovered its potential for creating squelchy, resonant acid sounds. What followed was a revolution in electronic music—from acid house to IDM to modern experimental music. The 303 isn't just an instrument; it's a cultural artifact that changed music forever.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
