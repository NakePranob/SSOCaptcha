import pkg from "./package.json";

const region = process.env.AWS_REGION;
const stage = process.env.STAGE;
const isAWSLambdaExecution = process.env.AWS_EXECUTION_ENV ? true : false;
const isProductionStage = stage === "prod";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "M Authen 2.0 - The Mall Group",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  ssr: false,
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/i18n'
  ],
  image: {},
  eslint: {},
  runtimeConfig: {
    public: {
      clientVersion: pkg.version,
      stage: process.env.STAGE,
      apiBaseUrl: `${process.env.NUXT_PUBLIC_API_BASE}/api/v1`,
      COGNITO_OAUTH2_ENDPOINT: process.env.COGNITO_OAUTH2_ENDPOINT,
      AWS_WAF_INTEGRATION_ENDPOINT: process.env.AWS_WAF_INTEGRATION_ENDPOINT,
      AWS_WAF_CAPTCHA_ENDPOINT: process.env.AWS_WAF_CAPTCHA_ENDPOINT,
      AWS_WAF_CAPTCHA_API_KEY: process.env.AWS_WAF_CAPTCHA_API_KEY,
    },
  },
  i18n: {
    strategy: "prefix",
    vueI18n: "./i18n/i18n.config.ts",
    defaultLocale: "en",
    lazy: true,
    locales: [
      {
        code: "en",
        language: "en-US",
        file: "en.json",
      },
      {
        code: "th",
        language: "th-TH",
        file: "th.json",
      },
    ],
  },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            "primary-app": {
              DEFAULT: "#E91C21", // สีหลัก
              100: '#E9A7A7', //FDE0E1
              200: '#EE8080',
              300: '#EE6B6B',
              400: '#E22E2E',
              500: '#E91C21',   // สีหลัก
              600: '#DF1818',
              700: '#CB1212',
              800: '#B90E0E',
              900: '#A50C0C',
              950: '#890A0A' // เข้มมาก
            },
            customGray: {
              50: '#FFFFFF',
              100: '#F5F7F9',
              200: '#DCE2E9',
              300: '#C3CED9',
              400: '#AABAC9',
              500: '#91A6B9',
              600: '#7891A9',
              700: '#617D98',
              800: '#51697F',
              900: '#415466',
              950: '#364655',
            },
          },
        },
      },
    },
  }
})