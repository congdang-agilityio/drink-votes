/** The organizer's "did you go?" question for a closed outing's winning venue. */
export function VisitQuestion({ outingId, venueName }: { outingId: string; venueName: string }) {
  return (
    <form method="post" action={`/outings/${outingId}/visit`} class="visit-question">
      <p>{`Đã đi ${venueName} chưa?`}</p>
      <button type="submit" name="visited" value="yes">
        Đã đi
      </button>{' '}
      <button type="submit" name="visited" value="no">
        Không đi
      </button>
    </form>
  );
}
