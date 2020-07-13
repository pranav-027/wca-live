defmodule WcaLiveWeb.Schema.AccountsTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  @desc "A user of the application, imported from the WCA website during the OAuth procedure."
  object :user do
    field :id, non_null(:id)
    field :wca_user_id, non_null(:integer)
    field :wca_id, :string
    field :name, non_null(:string)

    field :avatar, :avatar do
      resolve &Resolvers.Accounts.user_avatar/3
    end

    field :importable_competitions, non_null(list_of(non_null(:competition_brief))) do
      resolve &Resolvers.Accounts.user_importable_competitions/3
    end
  end

  object :accounts_queries do
    field :current_user, :user do
      resolve &Resolvers.Accounts.current_user/3
    end
  end
end