import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Darkest Dungeon Toolbox',
  description: 'a toolbox of darkest dungeon II to make your game more interesting',
  base: '/DarkestDungeonToolbox/',
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      link: '/zh',
      themeConfig: {
        nav: [
          { text: '主页', link: '/zh' },
          { text: '教程', link: '/zh/introduction' }
        ],
        sidebar: [
          {
            text: '教程',
            items: [
              { text: '介绍', link: '/zh/introduction' },
              { text: '安装', link: '/zh/install' },
              {
                text: '使用',
                items: [
                  { text: '切换语言', link: '/zh/use/language' },
                  { text: '从冥界归来', link: '/zh/use/resurrection' },
                  { text: '解锁一切', link: '/zh/use/unlock' }
                ]
              }
            ]
          },
          {
            text: '开发',
            items: [
              { text: '未来计划', link: '/zh/future' },
              { text: '贡献', link: '/zh/contribution' }
            ]
          }
        ],

        socialLinks: [
          {
            icon: {
              svg: '<svg class="Zi Zi--QQ Login-socialIcon" fill="#50c8fd" viewBox="0 0 24 24" width="40" height="40"><path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29 0 2.239.425 6.287.687 6.287 0 0-.688-1.768-1.182-1.768-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z" fill-rule="evenodd"></path></svg>'
            },
            link: 'https://qm.qq.com/q/j5VKkZSoZW',
            ariaLabel: 'QQ Group'
          },
          { icon: 'github', link: 'https://github.com/funny-cat-happy/DarkestDungeonToolbox' }
        ]
      }
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/introduction' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Install', link: '/install' },
          {
            text: 'Use',
            items: [
              { text: 'Switch Language', link: '/use/language' },
              { text: 'Being From Beyond', link: '/use/resurrection' },
              { text: 'Unlock Everything', link: '/use/unlock' }
            ]
          }
        ]
      },
      {
        text: 'Development',
        items: [
          { text: 'Future Plan', link: '/future' },
          { text: 'Contribution', link: '/contribution' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/funny-cat-happy/DarkestDungeonToolbox' }
    ]
  }
})
