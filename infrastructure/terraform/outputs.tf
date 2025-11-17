output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

output "s3_recordings_bucket" {
  description = "S3 bucket for recordings"
  value       = aws_s3_bucket.recordings.id
}

output "s3_recordings_bucket_arn" {
  description = "S3 bucket ARN for recordings"
  value       = aws_s3_bucket.recordings.arn
}
