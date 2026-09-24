-- Incrementa atomicamente o valor arrecadado de uma campanha quando uma
-- doação é confirmada (chamado pelo webhook de pagamento via service role).
create or replace function increment_campaign_amount(p_campaign_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  update campaigns
  set current_amount = current_amount + p_amount
  where id = p_campaign_id;
end;
$$;

revoke all on function increment_campaign_amount(uuid, numeric) from public;
grant execute on function increment_campaign_amount(uuid, numeric) to service_role;
