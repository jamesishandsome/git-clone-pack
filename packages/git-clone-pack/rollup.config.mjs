import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

export default [
	{
		input: "src/index.ts",
		plugins: [esbuild()],
		output: [
			{
				file: "dist/bundle.js",
				format: "cjs",
				sourcemap: true,
			},
		],
        external: ["react"],
	},
	{
		input: "src/index.ts",
		plugins: [dts()],
		output: {
			file: "dist/bundle.d.ts",
			format: "es",
		},
		external: ["react"],
	},
];
