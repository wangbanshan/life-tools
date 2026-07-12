import { Button, Group, Paper, Text, UnstyledButton } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { IconCalendarPlus, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMemo } from "react";
import type { Subscription } from "../subscription-data";
import {
  getMonthGridRange,
  getOccurrencesInRange,
  parseDateOnly,
  todayDateOnly,
} from "../subscription-dates";

const calendarClassNames = {
  calendarHeader: "subscription-official-calendar-header",
  calendarHeaderControl: "subscription-official-calendar-control",
  calendarHeaderLevel: "subscription-official-calendar-level",
  month: "subscription-official-month",
  monthCell: "subscription-official-month-cell",
  weekday: "subscription-official-weekday",
  day: "subscription-official-day",
};

function dayTitle(date: string) {
  const parsed = parseDateOnly(date);
  return `${parsed.getUTCMonth() + 1} 月 ${parsed.getUTCDate()} 日`;
}

export function SubscriptionCalendar({
  subscriptions,
  monthDate,
  selectedDate,
  onMonthChange,
  onDateSelect,
  onCreate,
}: {
  subscriptions: Subscription[];
  monthDate: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateSelect: (date: string) => void;
  onCreate: () => void;
}) {
  const range = getMonthGridRange(monthDate);
  const occurrences = useMemo(
    () => subscriptions.flatMap((subscription) => getOccurrencesInRange(subscription, range.start, range.end)),
    [range.end, range.start, subscriptions],
  );
  const occurrencesByDate = useMemo(() => {
    return occurrences.reduce<Record<string, typeof occurrences>>((groups, occurrence) => {
      (groups[occurrence.date] ??= []).push(occurrence);
      return groups;
    }, {});
  }, [occurrences]);
  const hasActiveSubscriptions = subscriptions.some((subscription) => subscription.status === "active");

  const handleMonthChange = (date: string) => {
    const month = `${date.slice(0, 7)}-01`;
    onMonthChange(month);
    if (selectedDate.slice(0, 7) !== date.slice(0, 7)) {
      onDateSelect(month);
    }
  };

  const selectDate = (date: string) => {
    onDateSelect(date);
    if (date.slice(0, 7) !== monthDate.slice(0, 7)) {
      onMonthChange(`${date.slice(0, 7)}-01`);
    }
  };

  return (
    <Paper className="subscription-calendar-panel">
      <Group className="subscription-calendar-toolbar" justify="space-between" wrap="nowrap">
        <Text className="subscription-calendar-heading">续费月历</Text>
        <UnstyledButton
          className="subscription-today-button"
          onClick={() => {
            const current = todayDateOnly();
            onMonthChange(`${current.slice(0, 7)}-01`);
            onDateSelect(current);
          }}
        >
          回到今天
        </UnstyledButton>
      </Group>

      {!hasActiveSubscriptions && (
        <div className="subscription-calendar-empty-banner">
          <div>
            <Text className="subscription-calendar-empty-title">还没有正在续费的会员</Text>
            <Text className="subscription-calendar-empty-copy">月历会一直保留，添加订阅后续费日期会自动出现。</Text>
          </div>
          <Button variant="light" color="apricot" leftSection={<IconCalendarPlus size={18} />} onClick={onCreate}>
            添加订阅
          </Button>
        </div>
      )}

      <div className="subscription-official-calendar-wrap">
        <Calendar
          className="subscription-official-calendar"
          classNames={calendarClassNames}
          date={monthDate}
          onDateChange={handleMonthChange}
          minLevel="month"
          maxLevel="year"
          firstDayOfWeek={1}
          highlightToday
          enableKeyboardNavigation
          monthLabelFormat="YYYY年M月"
          nextLabel="下个月"
          previousLabel="上个月"
          nextIcon={<IconChevronRight size={18} />}
          previousIcon={<IconChevronLeft size={18} />}
          getDayAriaLabel={(date) => `${dayTitle(date)}，${(occurrencesByDate[date] ?? []).length} 项续费`}
          getDayProps={(date) => ({
            selected: date === selectedDate,
            onClick: () => selectDate(date),
          })}
          renderDay={(date) => {
            const dayOccurrences = occurrencesByDate[date] ?? [];
            return (
              <span className="subscription-calendar-day-content">
                <span className="subscription-calendar-day-label">{parseDateOnly(date).getUTCDate()}</span>
                {dayOccurrences.length > 0 && (
                  <span className="subscription-calendar-event-indicator">
                    <span className="subscription-calendar-event-dot" />
                    <span className="subscription-calendar-event-count">{dayOccurrences.length}</span>
                  </span>
                )}
              </span>
            );
          }}
        />
      </div>
    </Paper>
  );
}
