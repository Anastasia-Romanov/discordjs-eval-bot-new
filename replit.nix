{ pkgs }: {
    deps = [
        pkgs.bashInteractive
        pkgs.vim
        pkgs.nodejs-17_x
        pkgs.nodePackages.pnpm
        pkgs.nodePackages.eslint
    ];
}
