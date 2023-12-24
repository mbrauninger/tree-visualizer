import Button from "@mui/material/Button";

interface ButtonProps {
  text: string;
  func: Function;
  funcArg?: any;
}

export const BottomButton = (props: ButtonProps) => {
  return (
    <Button
      style={{ marginRight: 5, height: 25, fontSize: 16 }}
      variant="contained"
      onClick={() => {
        props.funcArg ? props.func(props.funcArg) : props.func();
      }}
    >
      {props.text}
    </Button>
  );
};
