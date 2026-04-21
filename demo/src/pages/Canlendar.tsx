import { Canlendar } from '../../../src/components/Canlendar';
import { MonthWidget } from '../../../src/components/MonthWidget';
import { YearWidget } from '../../../src/components/YearWidget';

export const CanlendarPage = () => {
  return (
    <div>
      <Canlendar
        value="2026-04-04"
        onchange={(event) => {debugger
          console.log(event.detail);
        }}
      ></Canlendar>
      {/* <MonthWidget></MonthWidget>
      <YearWidget></YearWidget> */}
    </div>
  );
};
