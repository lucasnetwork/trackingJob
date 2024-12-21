import { JSX } from "solid-js";

const Button = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      class="bg-primary text-sm text-white flex items-center justify-center rounded px-6 py-1"
    >
      {props.children}
    </button>
  );
};

export default Button;
