import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Calendar from './components/Calendar';
import { TimeSheetProvider } from './context/TimeSheetContext';

function App() {
  return (
    <TimeSheetProvider>
      <div className="App">
        <header className="App-header">EMT</header>
        <Calendar />
      </div>
    </TimeSheetProvider>
  );
}

export default App;
