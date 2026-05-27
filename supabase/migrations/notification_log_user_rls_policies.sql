-- Allow authenticated users to read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON notification_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to mark their own notifications as read
CREATE POLICY "Users can mark their own notifications as read"
  ON notification_log FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
