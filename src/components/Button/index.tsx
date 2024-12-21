import { JSX } from "solid-js";

const Button = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      class="bg-primary text-white flex items-center justify-center rounded px-6 py-2"
    >
      {props.children}
    </button>
  );
};

export default Button;
