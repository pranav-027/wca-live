defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Wcif
  alias WcaLive.Wca
  alias WcaLive.Accounts
  alias WcaLive.Accounts.User

  alias WcaLive.Competitions.{Competition, Person, CompetitionBrief}

  alias Ecto.Changeset

  @doc """
  Returns the list of projects.
  """
  def list_competitions() do
    Repo.all(Competition)
  end

  @doc """
  Gets a single competition.
  """
  def get_competition(id), do: Repo.get(Competition, id)

  @doc """
  Gets a single competition.
  """
  def get_competition!(id), do: Repo.get!(Competition, id)

  @doc """
  Gets a single person.
  """
  def get_person(id), do: Repo.get(Person, id)

  def import_competition(wca_id, user) do
    with {:ok, access_token} <- Accounts.get_valid_access_token(user),
         {:ok, wcif} <- Wca.Api.get_wcif(wca_id, access_token.access_token) do
      %Competition{}
      |> Changeset.change()
      |> Changeset.put_assoc(:imported_by, user)
      |> Wcif.Import.import_competition(wcif)
    end
  end

  def synchronize_competition(competition) do
    imported_by = competition |> Ecto.assoc(:imported_by) |> Repo.one!()

    with {:ok, access_token} <- Accounts.get_valid_access_token(imported_by),
         {:ok, wcif} <- Wca.Api.get_wcif(competition.wca_id, access_token.access_token) do
      Wcif.Import.import_competition(competition, wcif)
    end

    # TODO: save synchronized WCIF back to the WCA website (resutls part).
  end

  @spec get_importable_competition_briefs(%User{}) :: list(CompetitionBrief.t())
  def get_importable_competition_briefs(user) do
    user = user |> Repo.preload(:access_token)
    {:ok, data} = Wca.Api.get_upcoming_manageable_competitions(user.access_token.access_token)

    competition_briefs =
      data
      |> Enum.filter(fn data -> data["announced_at"] != nil end)
      |> Enum.map(&CompetitionBrief.from_wca_json/1)

    wca_ids = Enum.map(competition_briefs, & &1.wca_id)

    imported_wca_ids =
      Repo.all(from c in Competition, where: c.wca_id in ^wca_ids, select: c.wca_id)

    Enum.filter(competition_briefs, fn competition ->
      competition.wca_id not in imported_wca_ids
    end)
  end
end
