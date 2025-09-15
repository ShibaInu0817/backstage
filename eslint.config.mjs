import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                  enforceBuildableLibDependency: true,
                  allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
                  depConstraints: [
                    { sourceTag: "layer:domain", onlyDependOnLibsWithTags: ["layer:domain"] },
                    { sourceTag: "layer:application", onlyDependOnLibsWithTags: ["layer:domain", "layer:application"] },
                    { sourceTag: "layer:infra", onlyDependOnLibsWithTags: ["layer:domain", "layer:infra", "layer:application"] },
                    // Apps can depend on anything (they are the composition root)
                    { sourceTag: "type:app", onlyDependOnLibsWithTags: ["layer:domain", "layer:application", "layer:infra"] }
                  ]

                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
