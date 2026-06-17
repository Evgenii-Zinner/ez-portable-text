import path from "path";
import { fileURLToPath } from "url";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import alias from "@rollup/plugin-alias";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/ez-portable-text.esm.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/ez-portable-text.umd.js",
      format: "umd",
      name: "EzPortableText",
      sourcemap: true,
    },
  ],
  plugins: [
    alias({
      entries: [
        {
          find: "react/compiler-runtime",
          replacement: path.resolve(
            __dirname,
            "src/mock/react-compiler-runtime.js",
          ),
        },
        { find: "react", replacement: "preact/compat" },
        { find: "react-dom/test-utils", replacement: "preact/test-utils" },
        { find: "react-dom", replacement: "preact/compat" },
        { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      ],
    }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    nodeResolve({
      browser: true,
      dedupe: [
        "preact",
        "preact/hooks",
        "preact/compat",
        "preact/jsx-runtime",
        "htm",
      ],
      preferBuiltins: false,
    }),
    commonjs(),
    postcss({
      extract: true,
      minimize: true,
      modules: false,
    }),
    terser({
      compress: {
        drop_console: true,
      },
    }),
  ],
};
