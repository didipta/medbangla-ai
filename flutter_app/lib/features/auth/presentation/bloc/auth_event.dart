import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class CheckAuthSessionEvent extends AuthEvent {}

class LoginDemoEvent extends AuthEvent {
  final String role; // 'patient' or 'doctor'

  const LoginDemoEvent({this.role = 'patient'});

  @override
  List<Object?> get props => [role];
}

class LoginGoogleEvent extends AuthEvent {
  final String credential;
  final String role;
  final String? bmdc;

  const LoginGoogleEvent({
    required this.credential,
    this.role = 'patient',
    this.bmdc,
  });

  @override
  List<Object?> get props => [credential, role, bmdc];
}

class LogoutEvent extends AuthEvent {}
