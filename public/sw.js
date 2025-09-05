if (!self.define) {
  let s,
    e = {};
  const a = (a, i) => (
    (a = new URL(a + '.js', i).href),
    e[a] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = a), (s.onload = e), document.head.appendChild(s));
        } else ((s = a), importScripts(a), e());
      }).then(() => {
        let s = e[a];
        if (!s) throw new Error(`Module ${a} didn’t register its module`);
        return s;
      })
  );
  self.define = (i, t) => {
    const c =
      s ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (e[c]) return;
    let n = {};
    const f = (s) => a(s, c),
      d = { module: { uri: c }, exports: n, require: f };
    e[c] = Promise.all(i.map((s) => d[s] || f(s))).then((s) => (t(...s), n));
  };
}
define(['./workbox-db63acfa'], function (s) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        {
          url: '/_next/app-build-manifest.json',
          revision: '6dbc8656088378c004484f94d01e894a',
        },
        {
          url: '/_next/dynamic-css-manifest.json',
          revision: 'd751713988987e9331980363e24189ce',
        },
        {
          url: '/_next/static/KCPjJQt1jvFLoezS2bbWv/_buildManifest.js',
          revision: 'f8d50ea4723431ec0804974e3ada1d2d',
        },
        {
          url: '/_next/static/KCPjJQt1jvFLoezS2bbWv/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1033-797d2c05ab6eb032.js',
          revision: '797d2c05ab6eb032',
        },
        {
          url: '/_next/static/chunks/1221.bbd9d2e4b0c0f138.js',
          revision: 'bbd9d2e4b0c0f138',
        },
        {
          url: '/_next/static/chunks/129-d515d0858989e7b1.js',
          revision: 'd515d0858989e7b1',
        },
        {
          url: '/_next/static/chunks/1325.1eef5fc5ccf0d0c7.js',
          revision: '1eef5fc5ccf0d0c7',
        },
        {
          url: '/_next/static/chunks/1520.c3c28e5ad40bb323.js',
          revision: 'c3c28e5ad40bb323',
        },
        {
          url: '/_next/static/chunks/1571.9f7e0943775d9d31.js',
          revision: '9f7e0943775d9d31',
        },
        {
          url: '/_next/static/chunks/1589.1af2646ad10a5c6b.js',
          revision: '1af2646ad10a5c6b',
        },
        {
          url: '/_next/static/chunks/1726.4c08f54d5e9c312d.js',
          revision: '4c08f54d5e9c312d',
        },
        {
          url: '/_next/static/chunks/1876.544c5050d64119bc.js',
          revision: '544c5050d64119bc',
        },
        {
          url: '/_next/static/chunks/2127-7c30adb1bd3d6d05.js',
          revision: '7c30adb1bd3d6d05',
        },
        {
          url: '/_next/static/chunks/221.695e2d94aa0da6da.js',
          revision: '695e2d94aa0da6da',
        },
        {
          url: '/_next/static/chunks/2227.4aa02361059913e9.js',
          revision: '4aa02361059913e9',
        },
        {
          url: '/_next/static/chunks/2335.e481effbdb21394a.js',
          revision: 'e481effbdb21394a',
        },
        {
          url: '/_next/static/chunks/2393.5dfdb28e7804bd68.js',
          revision: '5dfdb28e7804bd68',
        },
        {
          url: '/_next/static/chunks/2432.2af55bbb8add10d2.js',
          revision: '2af55bbb8add10d2',
        },
        {
          url: '/_next/static/chunks/2445.9e163c77ce3c0a32.js',
          revision: '9e163c77ce3c0a32',
        },
        {
          url: '/_next/static/chunks/248.de9c149898651858.js',
          revision: 'de9c149898651858',
        },
        {
          url: '/_next/static/chunks/2567-8a8c88aeecc4f6b9.js',
          revision: '8a8c88aeecc4f6b9',
        },
        {
          url: '/_next/static/chunks/26bd429b-b3b362148dcda2cf.js',
          revision: 'b3b362148dcda2cf',
        },
        {
          url: '/_next/static/chunks/2752-f5a0931194194427.js',
          revision: 'f5a0931194194427',
        },
        {
          url: '/_next/static/chunks/2927.d93292c58365aed8.js',
          revision: 'd93292c58365aed8',
        },
        {
          url: '/_next/static/chunks/2964.e12aa07c55296562.js',
          revision: 'e12aa07c55296562',
        },
        {
          url: '/_next/static/chunks/297.4c62cd6061fad011.js',
          revision: '4c62cd6061fad011',
        },
        {
          url: '/_next/static/chunks/2983.0e98c34da18c584d.js',
          revision: '0e98c34da18c584d',
        },
        {
          url: '/_next/static/chunks/2c7d8ac5-e45dfd00081a76c2.js',
          revision: 'e45dfd00081a76c2',
        },
        {
          url: '/_next/static/chunks/3023.1171ed49e6a5e875.js',
          revision: '1171ed49e6a5e875',
        },
        {
          url: '/_next/static/chunks/3156.b236b71b087af864.js',
          revision: 'b236b71b087af864',
        },
        {
          url: '/_next/static/chunks/3312.1487f1bfd0cc83fa.js',
          revision: '1487f1bfd0cc83fa',
        },
        {
          url: '/_next/static/chunks/3749.e71894bdb13104ea.js',
          revision: 'e71894bdb13104ea',
        },
        {
          url: '/_next/static/chunks/4028.678c12890a1ab52a.js',
          revision: '678c12890a1ab52a',
        },
        {
          url: '/_next/static/chunks/4030.12fcbe01d790f89b.js',
          revision: '12fcbe01d790f89b',
        },
        {
          url: '/_next/static/chunks/4073.de63c9a1dc03b53f.js',
          revision: 'de63c9a1dc03b53f',
        },
        {
          url: '/_next/static/chunks/4204.810c48f85d63594d.js',
          revision: '810c48f85d63594d',
        },
        {
          url: '/_next/static/chunks/435.a6b4c32a5a1da827.js',
          revision: 'a6b4c32a5a1da827',
        },
        {
          url: '/_next/static/chunks/4377.a3fa09d564752a5a.js',
          revision: 'a3fa09d564752a5a',
        },
        {
          url: '/_next/static/chunks/447.5aa12b086f67f3af.js',
          revision: '5aa12b086f67f3af',
        },
        {
          url: '/_next/static/chunks/455.6b6267ecdfd53e6e.js',
          revision: '6b6267ecdfd53e6e',
        },
        {
          url: '/_next/static/chunks/4587.b7e0acd77d7f10a0.js',
          revision: 'b7e0acd77d7f10a0',
        },
        {
          url: '/_next/static/chunks/4724.e517166576499563.js',
          revision: 'e517166576499563',
        },
        {
          url: '/_next/static/chunks/4774.85fc99191a030517.js',
          revision: '85fc99191a030517',
        },
        {
          url: '/_next/static/chunks/4821.fdeec64016c286d7.js',
          revision: 'fdeec64016c286d7',
        },
        {
          url: '/_next/static/chunks/4845.27b4e691ba2b9625.js',
          revision: '27b4e691ba2b9625',
        },
        {
          url: '/_next/static/chunks/4983.6470823973bdabd7.js',
          revision: '6470823973bdabd7',
        },
        {
          url: '/_next/static/chunks/4987.0d05f6fbd8a4ba5d.js',
          revision: '0d05f6fbd8a4ba5d',
        },
        {
          url: '/_next/static/chunks/5023.3a601263d4e4862c.js',
          revision: '3a601263d4e4862c',
        },
        {
          url: '/_next/static/chunks/505.84790e15eb2a4b85.js',
          revision: '84790e15eb2a4b85',
        },
        {
          url: '/_next/static/chunks/5159.13b6cf2d3369d600.js',
          revision: '13b6cf2d3369d600',
        },
        {
          url: '/_next/static/chunks/5257-a9f7951b89c87866.js',
          revision: 'a9f7951b89c87866',
        },
        {
          url: '/_next/static/chunks/5316.3675414a6000cdf2.js',
          revision: '3675414a6000cdf2',
        },
        {
          url: '/_next/static/chunks/5623.b6503157250d734c.js',
          revision: 'b6503157250d734c',
        },
        {
          url: '/_next/static/chunks/5732.040a5a754b754cf7.js',
          revision: '040a5a754b754cf7',
        },
        {
          url: '/_next/static/chunks/5775-34d705e5ec2aa326.js',
          revision: '34d705e5ec2aa326',
        },
        {
          url: '/_next/static/chunks/5777.d01c2718813b176f.js',
          revision: 'd01c2718813b176f',
        },
        {
          url: '/_next/static/chunks/5807.8ee5487aa93dda42.js',
          revision: '8ee5487aa93dda42',
        },
        {
          url: '/_next/static/chunks/5818.c471e00ff404eb28.js',
          revision: 'c471e00ff404eb28',
        },
        {
          url: '/_next/static/chunks/5918.169b963f487618fe.js',
          revision: '169b963f487618fe',
        },
        {
          url: '/_next/static/chunks/5976.246a9956086db05f.js',
          revision: '246a9956086db05f',
        },
        {
          url: '/_next/static/chunks/6008.18ed31f176cc52f7.js',
          revision: '18ed31f176cc52f7',
        },
        {
          url: '/_next/static/chunks/6165.ad6f020a9918d425.js',
          revision: 'ad6f020a9918d425',
        },
        {
          url: '/_next/static/chunks/6333.83b50272e274b2f5.js',
          revision: '83b50272e274b2f5',
        },
        {
          url: '/_next/static/chunks/6350.f91d51714bda5762.js',
          revision: 'f91d51714bda5762',
        },
        {
          url: '/_next/static/chunks/6370.0994c9e229d9dcff.js',
          revision: '0994c9e229d9dcff',
        },
        {
          url: '/_next/static/chunks/6747.0111629463afb96a.js',
          revision: '0111629463afb96a',
        },
        {
          url: '/_next/static/chunks/6822.6876a187864eead2.js',
          revision: '6876a187864eead2',
        },
        {
          url: '/_next/static/chunks/6834.8a835d74ed339d07.js',
          revision: '8a835d74ed339d07',
        },
        {
          url: '/_next/static/chunks/701.1139114b95b30d79.js',
          revision: '1139114b95b30d79',
        },
        {
          url: '/_next/static/chunks/7087.a4ad45247190b420.js',
          revision: 'a4ad45247190b420',
        },
        {
          url: '/_next/static/chunks/722.67b4ce7be639ba12.js',
          revision: '67b4ce7be639ba12',
        },
        {
          url: '/_next/static/chunks/726.6ec0198752d5efa6.js',
          revision: '6ec0198752d5efa6',
        },
        {
          url: '/_next/static/chunks/7260-dac01b7e3b12475d.js',
          revision: 'dac01b7e3b12475d',
        },
        {
          url: '/_next/static/chunks/7276.056d865498680287.js',
          revision: '056d865498680287',
        },
        {
          url: '/_next/static/chunks/7405.19c79b0200a6faab.js',
          revision: '19c79b0200a6faab',
        },
        {
          url: '/_next/static/chunks/7570.2b6e664f89fffe30.js',
          revision: '2b6e664f89fffe30',
        },
        {
          url: '/_next/static/chunks/7628.c451d9426183f547.js',
          revision: 'c451d9426183f547',
        },
        {
          url: '/_next/static/chunks/7639.38ad3a6a1dc62c71.js',
          revision: '38ad3a6a1dc62c71',
        },
        {
          url: '/_next/static/chunks/7899-5c95d596434a750a.js',
          revision: '5c95d596434a750a',
        },
        {
          url: '/_next/static/chunks/799.8cf51cd0773959ad.js',
          revision: '8cf51cd0773959ad',
        },
        {
          url: '/_next/static/chunks/8029.69da748075ba63dd.js',
          revision: '69da748075ba63dd',
        },
        {
          url: '/_next/static/chunks/8164.c49c900ec9649f72.js',
          revision: 'c49c900ec9649f72',
        },
        {
          url: '/_next/static/chunks/8238.95b0427a4d1d8715.js',
          revision: '95b0427a4d1d8715',
        },
        {
          url: '/_next/static/chunks/8697-f4197278a5e6931b.js',
          revision: 'f4197278a5e6931b',
        },
        {
          url: '/_next/static/chunks/8793-7d857f0fa674342b.js',
          revision: '7d857f0fa674342b',
        },
        {
          url: '/_next/static/chunks/8942.283f25bdfef4e7ba.js',
          revision: '283f25bdfef4e7ba',
        },
        {
          url: '/_next/static/chunks/9026.06706a0df765484e.js',
          revision: '06706a0df765484e',
        },
        {
          url: '/_next/static/chunks/9069.13879cea3c75325d.js',
          revision: '13879cea3c75325d',
        },
        {
          url: '/_next/static/chunks/9254.40caf451af6e9bf2.js',
          revision: '40caf451af6e9bf2',
        },
        {
          url: '/_next/static/chunks/9262.7ee50a38aa17bd5d.js',
          revision: '7ee50a38aa17bd5d',
        },
        {
          url: '/_next/static/chunks/9277.9dc421b988a71036.js',
          revision: '9dc421b988a71036',
        },
        {
          url: '/_next/static/chunks/9339.608dfdd00e8a0d8d.js',
          revision: '608dfdd00e8a0d8d',
        },
        {
          url: '/_next/static/chunks/9400.61d6ba68efb02249.js',
          revision: '61d6ba68efb02249',
        },
        {
          url: '/_next/static/chunks/9417.dae3d42ea8f72c51.js',
          revision: 'dae3d42ea8f72c51',
        },
        {
          url: '/_next/static/chunks/9648.17577f40aa31ef46.js',
          revision: '17577f40aa31ef46',
        },
        {
          url: '/_next/static/chunks/9671.0fdd6877a3360620.js',
          revision: '0fdd6877a3360620',
        },
        {
          url: '/_next/static/chunks/9771.d4799b75af729656.js',
          revision: 'd4799b75af729656',
        },
        {
          url: '/_next/static/chunks/9858.24750783e64989ee.js',
          revision: '24750783e64989ee',
        },
        {
          url: '/_next/static/chunks/a3086bf4-3e15f5409d6e316f.js',
          revision: '3e15f5409d6e316f',
        },
        {
          url: '/_next/static/chunks/aacc9ea5-ba5daf3ca08a507c.js',
          revision: 'ba5daf3ca08a507c',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-49ca96181f871b1d.js',
          revision: '49ca96181f871b1d',
        },
        {
          url: '/_next/static/chunks/app/api/auth/user/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/friends/remove/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/friends/request/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/friends/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/splits/%5Bid%5D/payment/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/splits/%5Bid%5D/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/splits/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/users/search/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/api/users/update/route-83d1c8aefa3d4e50.js',
          revision: '83d1c8aefa3d4e50',
        },
        {
          url: '/_next/static/chunks/app/create-split/page-efd25c1465b3c8a9.js',
          revision: 'efd25c1465b3c8a9',
        },
        {
          url: '/_next/static/chunks/app/friends/page-ce789ff949f9bcde.js',
          revision: 'ce789ff949f9bcde',
        },
        {
          url: '/_next/static/chunks/app/layout-1f1131a677ccea1a.js',
          revision: '1f1131a677ccea1a',
        },
        {
          url: '/_next/static/chunks/app/page-4249859699f177c3.js',
          revision: '4249859699f177c3',
        },
        {
          url: '/_next/static/chunks/app/profile/page-d21e08235646ec7e.js',
          revision: 'd21e08235646ec7e',
        },
        {
          url: '/_next/static/chunks/app/split/%5Bid%5D/page-1a8546373216d47b.js',
          revision: '1a8546373216d47b',
        },
        {
          url: '/_next/static/chunks/app/splits/page-72ef1c5bfbabbe89.js',
          revision: '72ef1c5bfbabbe89',
        },
        {
          url: '/_next/static/chunks/app/users/page-52bbf1d023bbf0c6.js',
          revision: '52bbf1d023bbf0c6',
        },
        {
          url: '/_next/static/chunks/app/wallet/page-b3ac7a26b547acb9.js',
          revision: 'b3ac7a26b547acb9',
        },
        {
          url: '/_next/static/chunks/framework-7368bad7704729dd.js',
          revision: '7368bad7704729dd',
        },
        {
          url: '/_next/static/chunks/main-9ddf475f292c879f.js',
          revision: '9ddf475f292c879f',
        },
        {
          url: '/_next/static/chunks/main-app-14adb40354b49e45.js',
          revision: '14adb40354b49e45',
        },
        {
          url: '/_next/static/chunks/pages/_app-3e9b1c7dbd54bdca.js',
          revision: '3e9b1c7dbd54bdca',
        },
        {
          url: '/_next/static/chunks/pages/_error-7f084cd7f1c1a483.js',
          revision: '7f084cd7f1c1a483',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-25f6416807dd980b.js',
          revision: '25f6416807dd980b',
        },
        {
          url: '/_next/static/css/01494c489b679fa9.css',
          revision: '01494c489b679fa9',
        },
        {
          url: '/_next/static/media/12084922609e6532-s.p.woff2',
          revision: 'd4db658f4dd63bc2d0d84f325a341e29',
        },
        {
          url: '/_next/static/media/22539d17f3707926-s.p.woff2',
          revision: 'cd790237ed63c56b30aa8fb9d99a7563',
        },
        {
          url: '/_next/static/media/b1dca2a5d44fc7a4-s.p.woff2',
          revision: '71a6023c087c936859024eb16ec7a519',
        },
        {
          url: '/_next/static/media/c6d20a6ba91d97e6-s.p.woff2',
          revision: 'd9749ed5ed84db875b4671a3f20b6d7d',
        },
        {
          url: '/_next/static/media/d3f699aba1c81be7-s.p.woff2',
          revision: '5481680cc24e1e83b5c9d3b7a5501a22',
        },
        {
          url: '/apple-touch-icon.png',
          revision: '7a9b030296eae57ca9ac14a90f9f3bc5',
        },
        { url: '/favicon.ico', revision: 'b3db2ff6bc9889eb177cacbba8eaceaa' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        {
          url: '/fonts/satoshi/WEB/README.md',
          revision: 'eac068daea733a9ba4bfb12188bfb223',
        },
        {
          url: '/fonts/satoshi/WEB/css/satoshi.css',
          revision: 'b292d2c188e313aacc0705cf6a52bfc9',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Black.eot',
          revision: '89390249ee84dfdfbc0fd94277d8dd95',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Black.ttf',
          revision: 'f12126e8a8e529e8195c7357dd5ad0c4',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Black.woff',
          revision: '8f3e2ffe218c63abbb190ae21e5914b3',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Black.woff2',
          revision: 'd9749ed5ed84db875b4671a3f20b6d7d',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BlackItalic.eot',
          revision: 'd7c707d7c0cef590b2abcbd69b638521',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BlackItalic.ttf',
          revision: 'bdec661cb56db4658d0421e0b51441be',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BlackItalic.woff',
          revision: '658c3f8c228e89126e72b1de62ae3075',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BlackItalic.woff2',
          revision: 'd28fa4c086f1b1a4bad3ca42f7441317',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Bold.eot',
          revision: 'c57e258d213ecf8cfe0a62f1671e1d81',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Bold.ttf',
          revision: '50eee48d495ab752b3e6b873b1206f10',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Bold.woff',
          revision: 'fc3b9a8724a46bc0439e8aedffbed4e0',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Bold.woff2',
          revision: 'd4db658f4dd63bc2d0d84f325a341e29',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BoldItalic.eot',
          revision: 'd264ae07a0580d45396975d232aff1ad',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BoldItalic.ttf',
          revision: 'cbbadbeec8490d033ca192e355d89d9e',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BoldItalic.woff',
          revision: '255104eefaebaabbf099285b4c9fc277',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-BoldItalic.woff2',
          revision: 'e66ffbf8f9e8d20d9755dc6b5750a6de',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Italic.eot',
          revision: '919d4cad729d77fd1109ef4b2ac26fcf',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Italic.ttf',
          revision: '002093bee822f0b3287ad4bad21e2a9f',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Italic.woff',
          revision: '993e96e16010788cca45739a47143066',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Italic.woff2',
          revision: '7e048c3007f86b11219b9ab2cfd1203c',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Light.eot',
          revision: '9194138dc6b1514d2a46f11150b1f8ff',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Light.ttf',
          revision: '02d43df8e0b9f0acb1d1c6b40aaa5b7e',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Light.woff',
          revision: 'd27d9203eb87ffbd40a6940b086e9afc',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Light.woff2',
          revision: '5481680cc24e1e83b5c9d3b7a5501a22',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-LightItalic.eot',
          revision: '11c0c98a171975d439500fe966465d62',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-LightItalic.ttf',
          revision: '055ba8c42d30b81454e272acebb74cab',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-LightItalic.woff',
          revision: '584ec39d7f98211c07c7db79b1b028b1',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-LightItalic.woff2',
          revision: 'e13da56de99251d8544a3eb74b798b2a',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Medium.eot',
          revision: '78fb45f456a61513628dcdeb87831eef',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Medium.ttf',
          revision: '7bec814954d059a7e7dae047285eedbc',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Medium.woff',
          revision: '3f3ea9424062d955ceee8e0fc2b15d70',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Medium.woff2',
          revision: 'cd790237ed63c56b30aa8fb9d99a7563',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-MediumItalic.eot',
          revision: '868fafb63df3bfbfb0423387374d49a7',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-MediumItalic.ttf',
          revision: 'd7e82ee45e48a2a617efa87155b6dc9f',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-MediumItalic.woff',
          revision: '6b31d60796818f0cdac5d25f0062331a',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-MediumItalic.woff2',
          revision: '3d53a7c37f5572f4d335d9b8f668d331',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Regular.eot',
          revision: '389d62aa26362deab1db61d201e556ac',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Regular.ttf',
          revision: '4da5359f3f975b25249e8cfcf142f39e',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Regular.woff',
          revision: '3adf562e446a18d90ba98f72ea08601c',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Regular.woff2',
          revision: '71a6023c087c936859024eb16ec7a519',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Variable.eot',
          revision: 'f953920d265c265d55029a0044a7b122',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Variable.ttf',
          revision: 'bc0207192e408b721fa14151690c6a66',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Variable.woff',
          revision: 'bd7cac4b844318aa2b2f168b57b45c22',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-Variable.woff2',
          revision: '70880e42f07b0386e261974cd14820a1',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-VariableItalic.eot',
          revision: '9888965098b0fe3121439e5293e5f63d',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-VariableItalic.ttf',
          revision: 'db98db5c0d84369d2586aaf5eedc3376',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-VariableItalic.woff',
          revision: 'aa09c255fd899a8d89fc4636c0c9db4d',
        },
        {
          url: '/fonts/satoshi/WEB/fonts/Satoshi-VariableItalic.woff2',
          revision: 'ed39abb752ab5d8f7d19f0a8d9523c7b',
        },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icon-144.png', revision: 'a8bde8ae6378711bba8670fa2d21b33c' },
        { url: '/icon-152.png', revision: '779bd995dd73187c5783ab2e7541f429' },
        { url: '/icon-192.png', revision: '7f5f805f4ed0de3024f9019f8b625fe3' },
        { url: '/icon-512.png', revision: '79463500d54197eae6ca597f7d36f60b' },
        { url: '/logo.png', revision: '591c9c42d0c32bca51da97ced6e59958' },
        { url: '/manifest.json', revision: 'bc67afaf457f3f765257ed2c2ae4ed72' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      '/',
      new s.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: s,
              response: e,
              event: a,
              state: i,
            }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      'GET',
    ),
    s.registerRoute(
      /^https?.*/,
      new s.NetworkFirst({
        cacheName: 'offlineCache',
        plugins: [new s.ExpirationPlugin({ maxEntries: 200 })],
      }),
      'GET',
    ));
});
