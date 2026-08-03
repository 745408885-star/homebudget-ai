from unittest.mock import Mock

import pytest
from sqlalchemy.orm import Session

from app.db import session as session_module

pytestmark = pytest.mark.unit


def test_database_dependency_rolls_back_and_closes_on_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database_session = Mock(spec=Session)
    monkeypatch.setattr(session_module, "SessionLocal", lambda: database_session)

    dependency = session_module.get_db()
    assert next(dependency) is database_session

    with pytest.raises(RuntimeError, match="test failure"):
        dependency.throw(RuntimeError("test failure"))

    database_session.rollback.assert_called_once_with()
    database_session.close.assert_called_once_with()
