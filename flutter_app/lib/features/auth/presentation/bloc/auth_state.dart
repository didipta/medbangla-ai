import 'package:equatable/equatable.dart';
import '../../domain/entities/user_entity.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitialState extends AuthState {}

class AuthLoadingState extends AuthState {}

class AuthenticatedState extends AuthState {
  final UserEntity user;

  const AuthenticatedState(this.user);

  @override
  List<Object?> get props => [user];
}

class UnauthenticatedState extends AuthState {
  final UserEntity guestUser;

  const UnauthenticatedState({this.guestUser = UserEntity.guest});

  @override
  List<Object?> get props => [guestUser];
}

class AuthErrorState extends AuthState {
  final String message;

  const AuthErrorState(this.message);

  @override
  List<Object?> get props => [message];
}
