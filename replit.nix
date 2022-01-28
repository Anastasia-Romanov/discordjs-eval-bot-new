{ pkgs }: {
    deps = [
        pkgs.bashInteractive
        pkgs.vim
        pkgs.nodejs-16_x
        pkgs.nodePackages.pnpm
        pkgs.nodePackages.eslint
    ];
}