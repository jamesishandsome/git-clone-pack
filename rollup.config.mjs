import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

export default [
	{
		input: "packages/git-clone-pack/main.ts",
		plugins: [esbuild()],
		output: [
			{
				file: "dist/index.js",
				format: "cjs",
				sourcemap: true,
			},
		],
		external: ["react"],
	},
	{
		input: "packages/git-clone-pack/main.ts",
		plugins: [dts()],
		output: {
			file: "dist/index.d.ts",
			format: "es",
		},
		external: ["react"],
	},
];
