/*

===Предпочтительные настройки (содержимое) tsconfig.json:
 {
 "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
//* "include": ["src/**///(слева один слеш, а не 3)*"],
//"exclude": ["node_modules", "**/*.test.ts"]
//}
/*
===В package.json добавляем scripts:
"scripts": {
    "dev": "yarn nodemon --inspect dist/index.js",
    "watch": "tsc -w"
  },
 */
