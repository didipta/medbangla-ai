import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  const Failure(this.message);

  @override
  List<Object?> get props => [message];
}

class ServerFailure extends Failure {
  final int? statusCode;
  const ServerFailure(super.message, {this.statusCode});

  @override
  List<Object?> get props => [message, statusCode];
}

class NetworkFailure extends Failure {
  const NetworkFailure([
    super.message = 'ইন্টারনেট সংযোগ পাওয়া যায়নি। (No Internet Connection)',
  ]);
}

class CacheFailure extends Failure {
  const CacheFailure([
    super.message = 'ক্যাশ ডাটা লোড ব্যর্থ হয়েছে। (Cache Failure)',
  ]);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([
    super.message = 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে পুনরায় লগইন করুন।',
  ]);
}
