import pytest

from ffd_data.export import build_all


@pytest.fixture(scope="session")
def built():
    return build_all()


@pytest.fixture(scope="session")
def observations(built):
    return built["observations.json"]["items"]


@pytest.fixture(scope="session")
def investigations(built):
    return {i["id"]: i for i in built["investigations.json"]["items"]}


@pytest.fixture(scope="session")
def by_investigation(observations):
    grouped = {}
    for obs in observations:
        grouped.setdefault(obs["investigation_id"], []).append(obs)
    return grouped
