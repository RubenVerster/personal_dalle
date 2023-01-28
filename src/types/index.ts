export type submitEvent = React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>;

export enum PixelOptions {
  small = '256x256',
  medium = '512x512',
  large = '1024x1024',
}
