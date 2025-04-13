export class AttendanceResponseDto {
  attendanceId: string;
  scheduleId: string;
  userId: string;
  distanceFromLocation: number;
  attendanceTime: Date;
  status: string;
  user: {
    UUID: string;
    username: string;
    email: string;
  };

  constructor(attendance: any) {
    this.attendanceId = attendance.attendanceId;
    this.scheduleId = attendance.scheduleId;
    this.userId = attendance.userId;
    this.distanceFromLocation = attendance.distanceFromLocation;
    this.attendanceTime = attendance.attendanceTime;
    this.status = attendance.status;
    this.user = {
      UUID: attendance.user.UUID,
      username: attendance.user.username,
      email: attendance.user.email,
    };
  }

  static mapList(attendances: any[]): AttendanceResponseDto[] {
    return attendances.map(
      (attendance) => new AttendanceResponseDto(attendance),
    );
  }
}
