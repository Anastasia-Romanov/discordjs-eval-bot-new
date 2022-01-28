{ pkgs }: {
    deps = [
        pkgs.bashInteractive
        pkgs.nodejs-16_x
        pkgs.nodePackages.pnpm
        pkgs.vim
    ];
}