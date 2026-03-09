import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

// Sample data for demonstration
const sampleEmployees = [
  { id: 1, name: 'John Doe', color: '#1a73e8' },
  { id: 2, name: 'Jane Smith', color: '#0b8043' },
  { id: 3, name: 'Robert Johnson', color: '#8e24aa' }
];

const generateAllEmployeesEvents = () => {
  const events = [];
  const currentDate = moment().startOf('month');
  const endDate = moment().endOf('month');

  while (currentDate <= endDate) {
    if (currentDate.day() !== 0 && currentDate.day() !== 6) { // Skip weekends
      // Generate events for each employee
      sampleEmployees.forEach(employee => {
        // Work time with random duration between 6-9 hours
        const workHours = 6 + Math.floor(Math.random() * 4);
        const workStart = moment(currentDate).hour(9).minute(0);
        const workEnd = moment(workStart).add(workHours, 'hours');
        
        // Pause time with random duration between 30-60 minutes
        const pauseDuration = 30 + Math.floor(Math.random() * 31);
        
        events.push({
          title: employee.name,
          start: workStart.format('YYYY-MM-DDTHH:mm:ss'),
          end: workEnd.format('YYYY-MM-DDTHH:mm:ss'),
          backgroundColor: employee.color,
          borderColor: employee.color,
          textColor: 'black',
          extendedProps: {
            type: 'workday',
            employeeId: employee.id,
            workHours,
            pauseDuration,
            workTime: `${workHours}h`,
            pauseTime: `${pauseDuration}min`
          }
        });
      });
    }
    currentDate.add(1, 'day');
  }
  return events;
};

const filterEventsByEmployee = (events, employeeId) => {
  if (employeeId === 'all') return events;
  return events.filter(event => event.extendedProps.employeeId === employeeId);
};

const TimeTableCalendar = () => {
  const [selectedEmployee, setSelectedEmployee] = useState({ id: 'all', name: 'Tous les employés' });
  const [events, setEvents] = useState(() => generateAllEmployeesEvents());
  const [filteredEvents, setFilteredEvents] = useState(events);

  const employeeOptions = [
    { id: 'all', name: 'Tous les employés' },
    ...sampleEmployees
  ];

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.value);
    setFilteredEvents(filterEventsByEmployee(events, e.value.id));
  };

  const eventContent = (eventInfo) => {
    const { workTime, pauseTime } = eventInfo.event.extendedProps;
    return (
      <div className="flex flex-col gap-1 p-2 rounded-md shadow-sm bg-white border-l-4"
           style={{
             borderLeftColor: eventInfo.event.backgroundColor,
           }}>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-800">
            {eventInfo.event.title}
          </span>
          <span className="ml-2 text-base font-semibold text-gray-600">
            {moment(eventInfo.event.start).format('HH:mm')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1">
            <i className="text-base pi pi-clock text-blue-500" />
            <span className="text-base font-medium text-gray-700">{workTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="text-base pi pi-pause text-orange-500" />
            <span className="text-base font-medium text-gray-700">{pauseTime}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium text-gray-700">Calendrier des Présences</span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <i className="pi pi-clock text-blue-500" />
              <span>Travail</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="pi pi-pause text-orange-500" />
              <span>Pause</span>
            </div>
          </div>
        </div>
        <Dropdown
          value={selectedEmployee}
          options={employeeOptions}
          onChange={handleEmployeeChange}
          optionLabel="name"
          placeholder="Sélectionner un employé"
          className="w-[250px]"
        />
      </div>
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          locale={frLocale}
          events={filteredEvents}
          eventContent={eventContent}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '18:00',
          }}
          eventBackgroundColor="white"
          eventBorderColor="#e5e7eb"
        />
      </div>
    </Card>
  );
};

export default TimeTableCalendar;
