
import { HTMLAttributes, forwardRef } from "react";
import { cva } from "class-variance-authority";

const classes = cva('border h-9 rounded-full px-6 font-medium', {
    variants: {
        variant: {
            primary: 'bg-[#66FF99] text-neutral-900 border-[#66FF99] ',
            secondary: 'border-white  text-white bg-transparent hover:bg-white/10',
        }
    },
})

const Button = forwardRef<HTMLButtonElement, {variant: 'primary' | 'secondary'} & HTMLAttributes<HTMLButtonElement>>(
  function Button(props, ref) {
    const {variant, className, ...rest} = props;
    return (
      <button ref={ref} className={classes({variant, className})} {...rest} />
    );
  }
);
Button.displayName = 'Button';
export default Button;
