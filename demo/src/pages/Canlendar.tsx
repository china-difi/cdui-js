import { Canlendar } from '../../../src/components/Canlendar';
import { MonthWidget } from '../../../src/components/MonthWidget';
import { YearWidget } from '../../../src/components/YearWidget';

export const CanlendarPage = () => {
  return (
    <div>
      <Canlendar
        value={new Date()}
        onValueChange={(date) => {
          console.log(date);
        }}
      ></Canlendar>
      <MonthWidget></MonthWidget>
      <YearWidget></YearWidget>
    </div>
  );
};
