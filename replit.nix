{ pkgs }: {
    deps = [
        pkgs.bashInteractive
        pkgs.zsh
        pkgs.vim
        pkgs.nodejs-18_x
        pkgs.nodePackages.pnpm
        pkgs.nodePackages.eslint
    ];
}
