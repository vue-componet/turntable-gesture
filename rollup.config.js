import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

import { eslint } from 'rollup-plugin-eslint'

export default {
  input: 'src/main.js',
  output: [
    // node服务端使用
    {
      file: 'dist/TurntableGesture.cjs.js',
      format: 'cjs',
      exports: 'auto',
    },
    // 浏览器使用
    {
      file: 'dist/TurntableGesture.iife.js',
      format: 'iife',
      name: 'TurntableGesture',
    },
    // es模块
    {
      file: 'dist/TurntableGesture.esm.js',
      format: 'es',
    },
    // 浏览器和node都可使用
    {
      file: 'dist/TurntableGesture.umd.js',
      format: 'umd',
      name: 'TurntableGesture',
    },
  ],
  plugins: [
    commonjs(),
    resolve(),
    babel({ babelHelpers: 'bundled' }),
    eslint({
      throwOnError: true,
    }),
    terser(),
    filesize(),
  ],
  // external: ['lodash']
}
