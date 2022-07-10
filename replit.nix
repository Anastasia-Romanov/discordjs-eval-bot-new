{ pkgs }: {
    deps = [
        pkgs.bashInteractive
        pkgs.vim
        pkgs.nodejs-18_x
        pkgs.nodePackages.pnpm
        pkgs.nodePackages.eslint
    ];
}
