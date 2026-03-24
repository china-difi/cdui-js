import { Canlendar } from '../../../src/components/Canlendar';

export const CanlendarPage = () => {
  return (
    <Canlendar
      value={new Date()}
      onValueChange={(date) => {
        console.log(date);
      }}
    ></Canlendar>
  );
};
