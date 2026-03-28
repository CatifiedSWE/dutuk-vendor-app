import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface MarkedDate {
    unavailable?: boolean;
    available?: boolean;
    hasEvent?: boolean;
    eventColor?: string;
    selected?: boolean;
}

export interface MarkedDatesMap {
    [date: string]: MarkedDate;
}

interface UnifiedCalendarProps {
    initialDate?: Date;
    selectedDate?: number;
    onDayPress?: (day: number, dateString: string, isCurrentMonth: boolean) => void;
    markedDates?: MarkedDatesMap;
    minDate?: string;
    disabled?: boolean;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
    initialDate,
    selectedDate: propSelectedDate,
    onDayPress,
    markedDates = {},
    minDate,
    disabled = false,
}) => {
    const now = initialDate || new Date();
    const [selectedDate, setSelectedDate] = useState(propSelectedDate || now.getDate());
    const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());

    useEffect(() => {
        if (propSelectedDate !== undefined) setSelectedDate(propSelectedDate);
    }, [propSelectedDate]);

    const currentMonth = `${MONTHS[currentMonthIndex]} ${currentYear}`;

    const navigateMonth = useCallback((direction: 'prev' | 'next') => {
        setCurrentMonthIndex((prev) => {
            let newMonth = prev;
            if (direction === 'prev') {
                newMonth = prev === 0 ? 11 : prev - 1;
                if (prev === 0) setCurrentYear((y) => y - 1);
            } else {
                newMonth = prev === 11 ? 0 : prev + 1;
                if (prev === 11) setCurrentYear((y) => y + 1);
            }
            return newMonth;
        });
    }, []);

    const getDateString = useCallback(
        (day: number) =>
            `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        [currentYear, currentMonthIndex],
    );

    const isDateDisabled = useCallback(
        (day: number, isCurrentMonth: boolean) => {
            if (!minDate || !isCurrentMonth) return false;
            return getDateString(day) < minDate;
        },
        [minDate, getDateString],
    );

    const weeks = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonthIndex, 1);
        const lastDay = new Date(currentYear, currentMonthIndex + 1, 0);
        const daysInCurrentMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

        const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];

        // Previous month trailing days
        const prevMonthLastDay = new Date(currentYear, currentMonthIndex, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            calendarDays.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
        }

        // Current month
        for (let day = 1; day <= daysInCurrentMonth; day++) {
            calendarDays.push({ day, isCurrentMonth: true });
        }

        // Next month leading days
        const remaining = 42 - calendarDays.length;
        for (let day = 1; day <= remaining; day++) {
            calendarDays.push({ day, isCurrentMonth: false });
        }

        const result: { day: number; isCurrentMonth: boolean }[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7));
        }
        return result;
    }, [currentYear, currentMonthIndex]);

    return (
        <View style={styles.calendar}>
            <View style={styles.calendarHeader}>
                <Pressable style={styles.navButton} onPress={() => navigateMonth('prev')} disabled={disabled}>
                    <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.monthText}>{currentMonth}</Text>
                <Pressable style={styles.navButton} onPress={() => navigateMonth('next')} disabled={disabled}>
                    <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </Pressable>
            </View>

            <View style={styles.weekDays}>
                {WEEK_DAYS.map((day) => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
            </View>

            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                    {week.map((dayObj, dayIndex) => {
                        const { day, isCurrentMonth } = dayObj;
                        const dateString = isCurrentMonth ? getDateString(day) : '';
                        const markedDate = markedDates[dateString];

                        const isUnavailable = markedDate?.unavailable || false;
                        const isAvailable = markedDate?.available || false;
                        const hasEvent = markedDate?.hasEvent || false;
                        const isSelected = day === selectedDate && isCurrentMonth;
                        const isDisabledDate = isDateDisabled(day, isCurrentMonth);

                        return (
                            <Pressable
                                key={dayIndex}
                                style={[
                                    styles.dayCell,
                                    isSelected && styles.selectedDay,
                                    isAvailable && !isSelected && styles.availableDay,
                                    (disabled || isDisabledDate) && styles.nonInteractiveDay,
                                ]}
                                onPress={() => {
                                    if (isCurrentMonth && !isDisabledDate && !disabled) {
                                        setSelectedDate(day);
                                        onDayPress?.(day, dateString, isCurrentMonth);
                                    }
                                }}
                                disabled={disabled || isDisabledDate}
                            >
                                <View style={styles.dayContent}>
                                    <Text
                                        style={[
                                            styles.dayText,
                                            !isCurrentMonth && styles.otherMonthText,
                                            isUnavailable && styles.unavailableText,
                                            isAvailable && !isSelected && styles.availableText,
                                            isSelected && styles.selectedDayText,
                                            isDisabledDate && styles.disabledText,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                    {hasEvent && isCurrentMonth && !isSelected && (
                                        <View
                                            style={[styles.eventDot, { backgroundColor: markedDate?.eventColor || '#800000' }]}
                                        />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    calendar: { width: '100%' },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    navButton: {
        width: 36,
        height: 36,
        backgroundColor: '#800000',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    monthText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1917',
        letterSpacing: -0.2,
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#57534e',
        width: 30,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    dayCell: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDay: {
        backgroundColor: '#800000',
        borderRadius: 15,
    },
    availableDay: {
        backgroundColor: '#000000',
        borderRadius: 15,
    },
    dayContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1c1917',
    },
    otherMonthText: { color: '#d6d3d1' },
    unavailableText: { color: '#FF3B30', fontWeight: '700' },
    availableText: { color: '#FFFFFF', fontWeight: '700' },
    selectedDayText: { color: '#FFFFFF', fontWeight: '700' },
    disabledText: { color: '#d6d3d1' },
    nonInteractiveDay: { opacity: 1 },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
});

export default React.memo(UnifiedCalendar);
