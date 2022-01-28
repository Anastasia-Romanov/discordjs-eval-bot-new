const Discord = require('discord.js');

const co = (...components) => {
  const comp = [];
  if (!components.length) return comp;
  if (
    components.length === 1 &&
    Array.isArray(components[0]) &&
    Array.isArray(components[0][0])
  )
    components = components.flat();
  if (!components.every(Array.isArray))
    throw new Error('You must provide arrays which represent ActionRows.');
  //const parseRow
  for (const row of components) {
    const actionRow = new Discord.MessageActionRow();
    comp.push(actionRow);
    // if (row.length) // nvm let discord do the validating
    actionRow.addComponents(row);
  }
  return comp;
};
co.button = (style, label, value, disabled, emoji) => {
  if (style && typeof style === 'object') return { type: 'BUTTON', ...style, };
  if (value === undefined && emoji === undefined)
    [
      style,
      label,
      value,
    ] = [
      'PRIMARY',
      style,
      label,
    ]; // only provided two arguments - button("name", "value")
  if (value && typeof value === 'object') value = JSON.stringify(value);
  const d = { type: 'BUTTON', label, emoji, style, disabled, };
  if (style === 'LINK' || style === 5) d.url = value;
  else d.customId = value;
  return d;
};
co.emoji = (style, emoji, value, disabled) => {
  if (
    (typeof emoji === 'undefined' || typeof value === 'undefined') &&
    typeof style !== 'object'
  )
    [
      style,
      emoji,
      value,
    ] = [
      'SECONDARY',
      style,
      emoji,
    ]; // one or two arguments
  if (typeof value === 'undefined') value = emoji; // no value
  return co.button(style, '', value, disabled, emoji);
};
co.select = (placeholder, customId, options, disabled) => {
  if (placeholder && typeof placeholder === 'object')
    return { type: 'SELECT_MENU', ...placeholder, };
  if (customId && typeof customId === 'object')
    customId = JSON.stringify(customId);
  return {
    type: 'SELECT_MENU',
    placeholder,
    customId,
    options: options?.options || options || [],
    disabled: disabled ?? options === false,
    minValues: options.minValues,
    maxValues: options.maxValues,
  };
};
co.options = (options, { min, max, } = {}) => ({
  minValues: min,
  maxValues: max,
  options: options || [],
});
co.option = (label, value, description, defaultSelected, emoji) => {
  if (label && typeof label === 'object') return label;
  if (value && typeof value === 'object') value = JSON.stringify(value);
  return { label, value, description, default: defaultSelected, emoji, };
};
Object.freeze(co);

module.exports = co;
