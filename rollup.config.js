import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import { pascalName } from './src/utils'

import pkg from './package.json'

export default {
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
  ],
  input: 'src/main.js',
  output: [{
    name: pascalName(pkg.name),
    format: 'umd',
    file: pkg.main
  }],
  watch: {
    include: 'src/**'
  }
}
