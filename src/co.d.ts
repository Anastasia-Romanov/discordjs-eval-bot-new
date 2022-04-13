import * as Discord from 'discord.js';

export type Component = Discord.MessageActionRowComponentResolvable;
export type SelectOptions = Pick<
  Discord.MessageSelectMenuOptions,
  'minValues' | 'maxValues' | 'options'
>;

const co: Readonly<{
  (...components: Component[][]): Discord.MessageActionRow[];

  button: ((style: Discord.MessageButtonOptions) => Component) &
    ((label: string, customId: string) => Component) &
    ((
      style: Discord.MessageButtonOptions['style'],
      label: string,
      customId?: unknown,
      disabled?: boolean,
      emoji?: string
    ) => Component);

  emoji: ((style: Discord.MessageButtonOptions) => Component) &
    ((emoji: string, customId?: string) => Component) &
    ((
      style: Discord.MessageButtonOptions['style'],
      emoji: string,
      customId: string,
      disabled?: boolean
    ) => Component);

  select: ((style: Discord.MessageSelectMenuOptions) => Component) &
    ((placeholder: string, customId: unknown, disabled: boolean) => Component) &
    ((
      placeholder: string,
      customId: unknown,
      options?: Discord.MessageSelectOptionData[] | SelectOptions,
      disabled?: boolean
    ) => Component);
  options: (
    options?: Discord.MessageSelectOptionData[],
    values?: Record<'min' | 'max', number>
  ) => SelectOptions;

  option: (
    style: Discord.MessageSelectMenuOptionData
  ) => Component &
    ((
      label: string,
      value: unknown,
      description?: string,
      defaultSelected?: boolean,
      emoji?: string
    ) => Component);
}>;

export = co;
